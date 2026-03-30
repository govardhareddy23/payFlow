import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middlewares/auth.js';
import { query, getClient } from '../db/index.js';
import { genRef } from '../utils/helpers.js';

const router = express.Router();

// Get transaction history
router.get('/history', protect, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM transactions 
       WHERE sender_id = $1 OR receiver_id = $1 
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Initiate Transfer (Process a payment)
router.post('/transfer', protect, async (req, res) => {
  const { target, targetType, amount, targetIfsc, pin } = req.body;
  const amt = parseFloat(amount);
  const ref = genRef();

  // Validate amount
  if (!amt || amt <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });
  if (amt > 100000) return res.status(400).json({ success: false, error: 'Amount exceeds per-transaction limit of ₹1,00,000' });

  // Get recipient info
  let receiver = null;
  try {
    let sql = `
      SELECT u.id, u.full_name as name, u.mobile, b.account_number, b.ifsc_code, b.upi_id
      FROM users u
      JOIN bank_accounts b ON u.id = b.user_id
    `;

    if (targetType === 'mobile') {
      const { rows } = await query(sql + ' WHERE u.mobile = $1', [target]);
      receiver = rows[0];
    } else if (targetType === 'bank') {
      const { rows } = await query(sql + ' WHERE b.account_number = $1 AND b.ifsc_code = $2', [target, targetIfsc]);
      receiver = rows[0];
    } else if (targetType === 'upi') {
      const { rows } = await query(sql + ' WHERE b.upi_id = $1', [target]);
      receiver = rows[0];
    } else {
      return res.status(400).json({ success: false, error: 'Invalid transfer method' });
    }

    if (!receiver) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }
    
    if (receiver.id === req.user.id) {
       return res.status(400).json({ success: false, error: 'Cannot send money to yourself' });
    }

    // Process Transaction Atomically
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Lock sender account and get info
      const { rows: senderRows } = await client.query(
        'SELECT balance, pin_hash, upi_id FROM bank_accounts WHERE user_id = $1 FOR UPDATE',
        [req.user.id]
      );
      
      const senderAcc = senderRows[0];

      // 2. Validate PIN
      const isMatch = await bcrypt.compare(pin, senderAcc.pin_hash);
      if (!isMatch) {
         // Log failed transaction
         const { rows: failedTxn } = await client.query(
            `INSERT INTO transactions (reference_id, sender_id, sender_name, sender_upi, receiver_name, receiver_upi, amount, method, status, fail_reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'FAILED', 'Wrong UPI PIN') RETURNING *`,
            [ref, req.user.id, req.user.full_name, senderAcc.upi_id, receiver.name, receiver.upi_id, amt, targetType]
         );
         await client.query('COMMIT');
         return res.status(401).json({ success: false, error: 'Incorrect UPI PIN', txn: failedTxn[0] });
      }

      // 3. Validate Balance
      if (parseFloat(senderAcc.balance) < amt) {
         const { rows: failedTxn } = await client.query(
            `INSERT INTO transactions (reference_id, sender_id, sender_name, sender_upi, receiver_name, receiver_upi, amount, method, status, fail_reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'FAILED', 'Insufficient Balance') RETURNING *`,
            [ref, req.user.id, req.user.full_name, senderAcc.upi_id, receiver.name, receiver.upi_id, amt, targetType]
         );
         await client.query('COMMIT');
         return res.status(400).json({ success: false, error: 'Insufficient balance', txn: failedTxn[0] });
      }

      // 4. Lock receiver account
      await client.query(
        'SELECT balance FROM bank_accounts WHERE user_id = $1 FOR UPDATE',
        [receiver.id]
      );

      // 5. Deduct from Sender
      await client.query(
        'UPDATE bank_accounts SET balance = balance - $1 WHERE user_id = $2',
        [amt, req.user.id]
      );

      // 6. Add to Receiver
      await client.query(
        'UPDATE bank_accounts SET balance = balance + $1 WHERE user_id = $2',
        [amt, receiver.id]
      );

      // 7. Record Transaction
      const { rows: successTxn } = await client.query(
        `INSERT INTO transactions (reference_id, sender_id, receiver_id, sender_name, receiver_name, sender_upi, receiver_upi, amount, method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SUCCESS') RETURNING *`,
        [ref, req.user.id, receiver.id, req.user.full_name, receiver.name, senderAcc.upi_id, receiver.upi_id, amt, targetType]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Transaction successful',
        txn: successTxn[0]
      });

    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Transaction Error: ', e);
      throw e;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error during transfer processing' });
  }
});

export default router;
