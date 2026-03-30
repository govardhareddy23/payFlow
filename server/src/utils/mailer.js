import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be an App Password, not your regular password
  },
});

export const sendOTPEmail = async (email, code, name) => {
  const mailOptions = {
    from: `"PayFlow Secure" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your PayFlow Verification Code: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center; font-family: 'Syne', sans-serif;">Verify your PayFlow Account</h2>
        <p>Hello ${name || 'User'},</p>
        <p>Use the following code to complete your verification:</p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
          <strong style="display: block; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; margin-bottom: 8px;">Verification Code:</strong>
          <span style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 8px;">${code}</span>
        </div>

        <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 5 minutes. Please do not share this with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
