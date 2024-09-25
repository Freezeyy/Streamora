const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN;
const USER = process.env.GMAIL_USER;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendPasswordResetEmail(user) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const info = await transporter.sendMail({
      from: `"Support Team" <${USER}>`, // sender address
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

    console.log('Password reset email sent: %s', info.messageId);
  } catch (error) {
    console.log('Failed to send password reset email', error.message);
  }
}

module.exports = sendPasswordResetEmail;
