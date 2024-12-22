const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Environment variables
const EMAIL_USER = process.env.MAIL_USERNAME;
const EMAIL_PASS = process.env.MAIL_PASSWORD;
const SMTP_HOST = process.env.MAIL_HOST;
const SMTP_PORT = process.env.MAIL_PORT;

async function sendPasswordResetEmail(user) {
  try {
    // Create a password reset token
    const resetToken = jwt.sign(
      { uid: user.id, email: user.email },
      process.env.PROJECT_JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Save the reset token to the user model (assuming a `reset_token` column exists)
    await user.update({ reset_token: resetToken });

    // Password reset link
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true, // Use SSL
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Support Team" <${EMAIL_USER}>`, // sender address
      to: user.email, // receiver
      subject: 'Password Reset Request', // Subject line
      html: `
        Hello ${user.name},<br><br>
        You requested to reset your password. Please click on the link below to reset it:<br><br>
        <a href="${resetUrl}">Reset Password</a><br><br>
        This link will expire in 1 hour.<br><br>
        Regards,<br>
        Support Team`,
    });

    console.log('✅ Password reset email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    console.error('Error Stack:', error.stack);
  }
}

module.exports = sendPasswordResetEmail;
