const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { toPublicUser } = require('../utils/publicUser');
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

const router = express.Router();
const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const instagramEnabled = Boolean(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET);
const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/providers', (req, res) => {
  res.json({
    google: googleEnabled,
    instagram: instagramEnabled,
  });
});

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, register);

router.post('/login', [
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, login);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!googleEnabled) {
    return res.redirect(`${frontendUrl}/login?error=google_disabled`);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const doc = await User.findById(req.user._id);
      const token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(toPublicUser(doc)))}`);
    } catch (error) {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

// Instagram OAuth routes
router.get('/instagram', (req, res, next) => {
  if (!instagramEnabled) {
    return res.redirect(`${frontendUrl}/login?error=instagram_disabled`);
  }
  return passport.authenticate('instagram')(req, res, next);
});

router.get('/instagram/callback',
  passport.authenticate('instagram', { session: false, failureRedirect: `${frontendUrl}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const doc = await User.findById(req.user._id);
      const token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(toPublicUser(doc)))}`);
    } catch (error) {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
