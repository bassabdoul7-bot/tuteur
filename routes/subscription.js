const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ tier: user.tier, isPremium: user.isPremium(), premiumExpiresAt: user.premiumExpiresAt, messagesUsed: user.messagesThisMonth, messagesLimit: user.isPremium() ? 'Unlimited' : 20 });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    user.tier = 'premium';
    user.premiumExpiresAt = expiresAt;
    user.messagesThisMonth = 0;
    await user.save();
    res.json({ message: 'Upgraded to premium', tier: user.tier, expiresAt: expiresAt });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

router.post('/downgrade', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.tier = 'free';
    user.premiumExpiresAt = null;
    user.messagesThisMonth = 0;
    await user.save();
    res.json({ message: 'Downgraded to free', tier: user.tier });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
