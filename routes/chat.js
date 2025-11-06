const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { message, response } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.canSendMessage()) return res.status(403).json({ message: 'Message limit reached', limit: 20, current: user.messagesThisMonth, tier: user.tier });
    user.messagesThisMonth += 1;
    await user.save();
    let chat = await ChatHistory.findOne({ userId: req.userId });
    if (!chat) chat = new ChatHistory({ userId: req.userId, messages: [] });
    chat.messages.push({ role: 'user', content: message }, { role: 'assistant', content: response });
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ message: 'Chat saved', messagesUsed: user.messagesThisMonth, messagesRemaining: user.isPremium() ? 'Unlimited' : 20 - user.messagesThisMonth });
  } catch (err) {
    res.status(500).json({ message: 'Error saving chat', error: err.message });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ userId: req.userId });
    if (!chat) return res.json({ messages: [] });
    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving chat', error: err.message });
  }
});

router.get('/count', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ messagesUsed: user.messagesThisMonth, messagesRemaining: user.isPremium() ? -1 : 20 - user.messagesThisMonth, tier: user.tier, isPremium: user.isPremium() });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
