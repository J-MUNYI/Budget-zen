const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

function initializeStrategies() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;

    console.log('Registering Google strategy with callback:', callbackURL);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const primaryEmail = normalizeEmail(profile.emails?.[0]?.value);
            if (!primaryEmail) {
              return done(new Error('Google account did not return an email address.'), null);
            }
            let user = await User.findOne({ email: primaryEmail });
            if (user) {
              if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
              }
              return done(null, user);
            }
            user = new User({
              name: profile.displayName,
              email: primaryEmail,
              googleId: profile.id,
              password: null,
            });
            await user.save();
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    console.warn('Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
  }
}

module.exports = { passport, initializeStrategies };