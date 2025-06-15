const { Op } = require('sequelize');
const { Message } = require('../models');
const { validateUUID } = require('../helpers/validation');

exports.getConversations = async (req, res) => {
  const otherUserId = req.params.userId;
  const { before, limit = 50 } = req.query;
  const myId = req.user.id;

  // validate UUID
  const { error } = validateUUID(otherUserId);
  if (error) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  // build where-clause
  const where = {
    [Op.or]: [
      { senderId: myId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: myId },
    ]
  };
  if (before) {
    where.createdAt = { [Op.lt]: new Date(before) };
  }

  try {
    const messages = await Message.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
    });
    // reverse so client sees oldest first
    res.json(messages.reverse());
  } catch (err) {
    console.error(`GET /conversations/${otherUserId} error`, err);
    res.status(500).json({ message: 'Server error' });
  }
};
