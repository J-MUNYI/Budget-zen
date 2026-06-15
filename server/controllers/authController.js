const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { toPublicUser } = require('../utils/publicUser');
const { normalizeEmail } = require('../utils/normalizeEmail');
const { signAuthToken } = require('../utils/token');
const { asyncHandler } = require('../utils/asyncHandler');

function isBcryptHash(value = '') {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

exports.register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  let user = await User.findOne({ email });

  if (user && user.password) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (user) {
    user.name = user.name || name;
    user.password = hashedPassword;
    await user.save();
  } else {
    user = new User({ name, email, password: hashedPassword });
    await user.save();
  }

  const token = signAuthToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.password) {
    const availableProviders = [];
    if (user.googleId) availableProviders.push('Google');
    if (user.instagramId) availableProviders.push('Instagram');

    return res.status(400).json({
      message: availableProviders.length
        ? `This account uses ${availableProviders.join(' or ')} sign-in. Register with the same email to add a password, or continue with your provider.`
        : 'This account does not have a password yet. Register again with the same email to create one.',
    });
  }

  let isMatch = false;
  if (isBcryptHash(user.password)) {
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    // Allow legacy plaintext test users to log in once, then migrate them to bcrypt.
    isMatch = password === user.password;
    if (isMatch) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }
  }

  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = signAuthToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});
