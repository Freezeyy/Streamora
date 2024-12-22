const nodemailer = require('nodemailer');

// Mail configuration from .env
const EMAIL_USER = process.env.MAIL_USERNAME;
const EMAIL_PASS = process.env.MAIL_PASSWORD;
const SMTP_HOST = process.env.MAIL_HOST;
const SMTP_PORT = process.env.MAIL_PORT;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // Use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function sendMailVerifyEmail(user) {
  try {
    const mailOptions = {
      from: `"Support Team" <${EMAIL_USER}>`, // Sender address
      to: user.email, // Receiver's email
      subject: 'Signup Successful', // Subject line
      html: `
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up. Your account has been successfully created. Please log in to complete your profile.</p>
        <p>Regards,<br>Support Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    console.error('Error Stack:', error.stack);
  }
}

module.exports = sendMailVerifyEmail;
