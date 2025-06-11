// server/routes/conversations.js
const express = require('express');
const { Op } = require('sequelize');
const { Message } = require('../models');
const authMiddleware = require('../middleware/auth');
const { validateUUID } = require('../helpers/validation');

const router = express.Router();

router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId: otherUserId } = req.params;

  // 1) Validate it's a UUID
  const { error: idError } = validateUUID(otherUserId);
  if (idError) {
    return res.status(400).json({ message: 'Invalid userId parameter' });
  }

  const myId = req.user.id; // this is also a UUID

  try {
    // 2) Query last 50 messages
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: myId,    receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(messages.reverse());
  } catch (err) {
    console.error(`GET /conversations/${otherUserId} error`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
