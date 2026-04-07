const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists, update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: null, // OAuth users don't have passwords
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
  console.warn(
    'Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google login will be disabled.'
  );
}

// Instagram OAuth Strategy (only if configured)
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  passport.use(
    new InstagramStrategy(
      {
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL:
          process.env.INSTAGRAM_CALLBACK_URL ||
          `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/instagram/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Instagram Basic-style flows may not provide an email, so we generate a stable placeholder.
          const email = `${profile.id}@instagram.local`;
          const name = profile.displayName || profile.username || `Instagram User ${profile.id}`;

          let user = await User.findOne({
            $or: [{ email }, { instagramId: profile.id }],
          });

          if (user) {
            if (!user.instagramId) {
              user.instagramId = profile.id;
              if (!user.name) {
                user.name = name;
              }
              await user.save();
            }
            return done(null, user);
          }

          user = new User({
            name,
            email,
            instagramId: profile.id,
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
  console.warn(
    'Instagram OAuth not configured: missing INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET. Instagram login will be disabled.'
  );
}

module.exports = passport;
