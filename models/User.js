const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  premiumExpiresAt: { type: Date, default: null },
  messagesThisMonth: { type: Number, default: 0 },
  lastMessageReset: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPremium = function() {
  if (this.tier === 'premium' && this.premiumExpiresAt) {
    return new Date() < this.premiumExpiresAt;
  }
  return false;
};

userSchema.methods.canSendMessage = function() {
  if (this.isPremium()) return true;
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (this.lastMessageReset < monthAgo) {
    this.messagesThisMonth = 0;
    this.lastMessageReset = now;
  }
  return this.messagesThisMonth < 20;
};

module.exports = mongoose.model('User', userSchema);
