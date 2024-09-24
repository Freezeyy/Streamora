// const nodemailer = require('nodemailer');

// async function sendMailVerifyEmail(url, user) {
//   try {
//     // Check if environment variables are properly loaded
//     console.log('MAIL_HOST:', process.env.MAIL_HOST);
//     console.log('MAIL_PORT:', process.env.MAIL_PORT);
//     console.log('MAIL_USERNAME:', process.env.MAIL_USERNAME);
    
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: process.env.MAIL_PORT == '465', // Use SSL for port 465
//       auth: {
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"Support Team" <${process.env.MAIL_USERNAME}>`, // sender address
//       to: user.email, // receiver
//       subject: 'Email Verification', // Subject line
//       html: `
//         Hello ${user.name},<br><br>
//         Thank you for signing up. Please verify your email by clicking on the following link:<br><br>
//         <a href="${url}">Verify Email</a><br><br>
//         If the link doesn't work, copy and paste this URL into your browser: ${url}<br><br>
//         Regards,<br>
//         Support Team`,
//     });

//     console.log('Verification email sent: %s', info.messageId);
//   } catch (error) {
//     console.log('Failed to send verification email', error.message);
//   }
// }

// module.exports = sendMailVerifyEmail;


const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 credentials from Google Cloud Console
const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';  // for testing
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN;
const USER = process.env.GMAIL_USER;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMailVerifyEmail( user ) {
  try {

    // console.log('Sending verification email to:', user.email);
    // console.log('check jap:', user);
    // console.log('ni apelak:', url);



    const accessToken = await oauth2Client.getAccessToken();

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
      subject: 'Signup Successful', // Subject line
      html: `
        Hello ${user.name},<br><br>
        Thank you for signing up. We are please to tell you that you have successfully signup for an account on our platform. Please login to complete your account creation<br><br>
        Regards,<br>
        Support Team`,
    });

    console.log('Verification email sent: %s', info.messageId);
  } catch (error) {
    console.log('Failed to send verification email', error.message);
  }
}

module.exports = sendMailVerifyEmail;
