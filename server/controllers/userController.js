const User = require('../models/User');
const { toPublicUser } = require('../utils/publicUser');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};

    if (body.monthlyIncome !== undefined) {
      if (body.monthlyIncome === null || body.monthlyIncome === '') {
        updates.monthlyIncome = null;
      } else {
        const n = Number(body.monthlyIncome);
        if (Number.isNaN(n) || n < 0) {
          return res.status(400).json({ message: 'monthlyIncome must be a non-negative number or empty' });
        }
        updates.monthlyIncome = n;
      }
    }

    if (body.mpesaBalance !== undefined) {
      const n = Number(body.mpesaBalance);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ message: 'mpesaBalance must be a non-negative number' });
      }
      updates.mpesaBalance = n;
    }

    if (body.mpesaPhoneLast4 !== undefined) {
      const s = String(body.mpesaPhoneLast4).replace(/\D/g, '').slice(0, 4);
      updates.mpesaPhoneLast4 = s;
    }

    if (body.insightsFocus !== undefined) {
      updates.insightsFocus = String(body.insightsFocus).slice(0, 2000);
    }

    if (Object.keys(updates).length === 0) {
      const user = await User.findById(req.user.id).select('-password');
      return res.json(toPublicUser(user));
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
