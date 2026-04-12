const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      // Password is required only if user doesn't have OAuth IDs
      return !this.googleId && !this.instagramId;
    }
  },
  googleId: { type: String, sparse: true },
  instagramId: { type: String, sparse: true },
  monthlyIncome: { type: Number, default: null },
  mpesaBalance: { type: Number, default: 0 },
  mpesaPhoneLast4: { type: String, default: '' },
  insightsFocus: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
