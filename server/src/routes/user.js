import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middlewares/auth.js';
import { query } from '../db/index.js';

const router = express.Router();

// Get current user profile & balance
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// Change UPI PIN
router.put('/change-pin', protect, async (req, res) => {
  const { newPin } = req.body;

  if (!newPin || newPin.length !== 6) {
    return res.status(400).json({ success: false, error: 'Valid 6-digit PIN required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(newPin, salt);

    await query(
      'UPDATE bank_accounts SET pin_hash = $1 WHERE user_id = $2',
      [pinHash, req.user.id]
    );

    res.status(200).json({ success: true, message: 'UPI PIN updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Verify balance with PIN
router.post('/balance', protect, async (req, res) => {
  const { pin } = req.body;

  try {
    const { rows } = await query(
      'SELECT pin_hash, balance FROM bank_accounts WHERE user_id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Bank account not found' });
    }

    const { pin_hash, balance } = rows[0];
    const isMatch = await bcrypt.compare(pin, pin_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect UPI PIN' });
    }

    res.status(200).json({ success: true, balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Lookup recipient name for verification
router.get('/lookup', protect, async (req, res) => {
  const { type, val, ifsc } = req.query;

  if (!type || !val) {
    return res.status(400).json({ success: false, error: 'Type and value are required' });
  }

  try {
    let sql = `
      SELECT u.full_name 
      FROM users u 
      JOIN bank_accounts b ON u.id = b.user_id
    `;
    let params = [val];

    if (type === 'mobile') {
      sql += ' WHERE u.mobile = $1 ';
    } else if (type === 'upi') {
      sql += ' WHERE b.upi_id = $1 ';
    } else if (type === 'bank') {
      sql += ' WHERE b.account_number = $1 AND b.ifsc_code = $2 ';
      params.push(ifsc || '');
    } else {
      return res.status(400).json({ success: false, error: 'Invalid lookup type' });
    }

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    res.status(200).json({ success: true, name: rows[0].full_name });
  } catch (err) {
    console.error(err);
    res.status(200).json({ success: false, error: 'Lookup failed' });
  }
});

export default router;
