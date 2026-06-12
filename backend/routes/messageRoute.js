const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/api/messages', auth, async (req, res) => {
  try {
    
    const messages = await Message.find({})
      .populate('user', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const message = new Message({
      content: content.trim(),
      user: req.user._id,
      read: [req.user._id] 
    });
    
    await message.save();
    
    
    await message.populate('user', 'username avatar');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/api/users/active', auth, async (req, res) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    
    const activeUserIds = await Message.distinct('user', { 
      createdAt: { $gte: fifteenMinutesAgo } 
    });
    
    
    if (!activeUserIds.includes(req.user._id)) {
      activeUserIds.push(req.user._id);
    }
    
    const activeUsers = await User.find({ 
      _id: { $in: activeUserIds } 
    }).select('username avatar');
    
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;