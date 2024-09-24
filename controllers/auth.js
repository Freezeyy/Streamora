const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const svc = require('../services');

const refreshTokens = {};

function login(req, res, next) {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        res.status(401).json({ error: 'fail to authenticate user', details: info.message });
        return;
      }
      req.login(user, { session: false }, async (error) => {
        if (error) next(error);
        if (user.reset_token) user.update({ reset_token: null });
        const jwt_content = { uid: user.id, email: user.email, role: 'admin' };
        // Sign the JWT token and populate the payload with the user email and id
        // Send back the token to the user
        const token = jwt.sign(jwt_content, process.env.PROJECT_JWT_SECRET, { expiresIn: 86400 });
        const refreshToken = randtoken.uid(256);
        refreshTokens[refreshToken] = user.email;
        res.json({ token, refreshToken });
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
}

// function signup(req, res, next) {
//   passport.authenticate('signup', { session: false }, async (err, user, info) => {
//     try {
//       if (err || !user) res.status(401).json({ error: 'fail to register user', message: info.message });
//       res.status(201).json({ user });
//     } catch (error) {
//       next(error);
//     }
//   })(req, res, next);
// }

function signup(req, res, next) {
  passport.authenticate('signup', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) {
        res.status(401).json({ error: 'fail to register user', message: info.message });
        return;
      }

      console.log('User:', user);
      

      // Generate a token for email verification
      const verificationToken = jwt.sign(
        { uid: user.id, email: user.email }, 
        process.env.PROJECT_JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Save the token in the user record or send it via email
      const verificationUrl = `${req.body.redirect_url}/verify-email?token=${verificationToken}`;
      
      // Call your email service to send the verification email
      svc.verifyMail(user, verificationUrl);

      res.status(201).json({ user, message: 'Verification email sent!' });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
}

async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.PROJECT_JWT_SECRET);
    const user = await m.User.findOne({ where: { id: decoded.uid } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user to mark them as verified
    await user.update({ verifiedAt: new Date() });

    res.json({ message: 'Email successfully verified!' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
}

function passwordResetTokenValidation(req, res, next) {
  passport.authenticate('forgotpasswordjwt', async (err, user) => {
    try {
      if (err || !user) {
        res.status(404).json({ error: err || 'User not found' });
      } else if (!user.reset_token || user.reset_token !== req.body.token) {
        res.status(422).json({ error: 'Token is invalid' });
      } else {
        res.json({ status: true });
      }
      next();
    } catch (error) {
      res.status(500).json({ error });
      next();
    }
  })(req, res, next);
}

function passwordReset(req, res, next) {
  passport.authenticate('forgotpasswordjwt', async (err, user) => {
    try {
      if (err || !user) {
        res.status(404).json({ error: err });
        return;
      }
      if (!user.reset_token || user.reset_token !== req.body.token) {
        res.status(422).json({ error: 'Token is invalid' });
        return;
      }
      user.update({
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync()),
        reset_token: null,
      });
      res.json({ status: 'successfuly update user password' });
    } catch (error) {
      res.status(500).json({ error });
    }
  })(req, res, next);
}

module.exports = {
  login, signup, verifyEmail, passwordResetTokenValidation, passwordReset,
};
