import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const genAcc = () => "ACC" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, "0");
export const genIFSC = () => ["PYFL","UPIB","DIGI","FAST"][~~(Math.random()*4)] + "0" + (~~(Math.random()*900000)+100000);
export const genUPI = (name) => name.toLowerCase().replace(/\s+/g,"").slice(0,8) + (~~(Math.random()*9000)+1000) + "@payflow";
export const genOTP = () => String(~~(Math.random()*900000)+100000);
export const genRef = () => "REF" + Math.random().toString(36).slice(2,11).toUpperCase();
