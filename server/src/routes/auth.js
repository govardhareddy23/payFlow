import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getClient } from '../db/index.js';
import { generateToken, genAcc, genIFSC, genUPI, genOTP } from '../utils/helpers.js';
import { sendOTPEmail } from '../utils/mailer.js';

const router = express.Router();

// Helper to check user existence by mobile or account number
const findUser = async (val, mode) => {
  let sql = `
    SELECT u.id, u.mobile, u.email, u.full_name as name 
    FROM users u 
    LEFT JOIN bank_accounts b ON u.id = b.user_id
  `;
  if (mode === 'mobile') {
    sql += ' WHERE u.mobile = $1';
  } else {
    sql += ' WHERE b.account_number = $1';
  }
  const { rows } = await query(sql, [val]);
  return rows.length > 0 ? rows[0] : null;
};

// Initiate Login (generate OTPs)
router.post('/login/init', async (req, res) => {
  const { loginVal, loginMode } = req.body;

  try {
    const user = await findUser(loginVal, loginMode);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please register.' });
    }

    const code = genOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

    await query(
      `INSERT INTO otp_records (identifier, otp_code, email_code, purpose, expires_at) 
       VALUES ($1, '000000', $2, 'login', $3)`,
      [user.mobile, code, expiresAt]
    );

    // Send unified Email OTP
    await sendOTPEmail(user.email, code, user.name);

    res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent to your email',
        simulated: process.env.NODE_ENV === 'development' ? { code } : null 
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Verify Login OTP
router.post('/login/verify', async (req, res) => {
  const { loginVal, loginMode, otpIn, emailIn } = req.body;

  try {
    const user = await findUser(loginVal, loginMode);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { rows: otps } = await query(
      `SELECT * FROM otp_records 
       WHERE identifier = $1 AND purpose = 'login' AND used = false 
       ORDER BY created_at DESC LIMIT 1`,
      [user.mobile]
    );

    if (otps.length === 0) return res.status(400).json({ success: false, error: 'No active OTP found' });

    const record = otps[0];
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (record.email_code !== emailIn) {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    // Mark used
    await query('UPDATE otp_records SET used = true WHERE id = $1', [record.id]);

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Initiate Registration
router.post('/register/init', async (req, res) => {
  const { mobile, email, name } = req.body;

  try {
    // Check if unique
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE mobile = $1 OR email = $2', 
      [mobile, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Mobile or Email already registered' });
    }

    const code = genOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await query(
      `INSERT INTO otp_records (identifier, otp_code, email_code, purpose, expires_at) 
       VALUES ($1, '000000', $2, 'register', $3)`,
      [mobile, code, expiresAt]
    );

    // Send unified Email OTP
    await sendOTPEmail(email, code, name);

    res.status(200).json({
      success: true,
      data: {
        message: 'Verification code sent to your email',
        simulated: process.env.NODE_ENV === 'development' ? { code } : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Verify Registration & Complete Setup
router.post('/register/verify', async (req, res) => {
  const { mobile, email, name, address, dob, otpIn, emailIn, pin } = req.body;

  try {
    const { rows: otps } = await query(
      `SELECT * FROM otp_records 
       WHERE identifier = $1 AND purpose = 'register' AND used = false 
       ORDER BY created_at DESC LIMIT 1`,
      [mobile]
    );

    if (otps.length === 0) return res.status(400).json({ success: false, error: 'No active OTP found' });
    
    const record = otps[0];
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ success: false, error: 'OTP expired' });
    if (record.email_code !== emailIn) return res.status(400).json({ success: false, error: 'Invalid verification code' });

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(pin, salt);

      // Create user
      const { rows: userRows } = await client.query(
        `INSERT INTO users (full_name, mobile, email, address, dob, is_verified) 
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [name, mobile, email, address, dob || null]
      );
      const userId = userRows[0].id;

      // Create bank account
      const initBalance = process.env.WELCOME_BONUS || 10000;
      await client.query(
        `INSERT INTO bank_accounts (user_id, account_number, ifsc_code, upi_id, pin_hash, balance) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, genAcc(), genIFSC(), genUPI(name), pinHash, initBalance]
      );

      // Mark OTP used
      await client.query('UPDATE otp_records SET used = true WHERE id = $1', [record.id]);
      
      await client.query('COMMIT');
      
      const token = generateToken(userId);
      res.status(201).json({ success: true, token, message: 'Account created successfully' });

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
