import { verifyToken } from '../utils/helpers.js';
import { query } from '../db/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
      }

      // Query database for user with bank account
      const { rows } = await query(
        `SELECT u.id, u.full_name, u.mobile, u.email, u.address, 
                b.account_number, b.ifsc_code, b.upi_id, b.balance 
         FROM users u 
         LEFT JOIN bank_accounts b ON u.id = b.user_id 
         WHERE u.id = $1`,
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};
