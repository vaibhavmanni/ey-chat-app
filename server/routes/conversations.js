// server/routes/conversations.js
const express = require('express');
const { Op } = require('sequelize');
const { Message } = require('../models');
const authMiddleware = require('../middleware/auth');
const { validateUUID } = require('../helpers/validation');

const router = express.Router();

// GET /conversations/:userId?before=<ISO>&limit=<n>
router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId: otherUserId } = req.params;
  const { before, limit = 50 } = req.query;
  const myId = req.user.id;

  // validate UUID
  const { error } = validateUUID(otherUserId);
  if (error) return res.status(400).json({ message: 'Invalid userId' });

  // build where-clause
  const base = {
    [Op.or]: [
      { senderId: myId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: myId },
    ],
  };
  if (before) {
    base.createdAt = { [Op.lt]: new Date(before) };
  }

  try {
    const messages = await Message.findAll({
      where: base,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
    });
    // reverse so client sees oldest first
    res.json(messages.reverse());
  } catch (err) {
    console.error(`GET /conversations/${otherUserId} error`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
