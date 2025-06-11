// server/routes/users.js
const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /users
// Returns all users, omitting passwordHash
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (err) {
    console.error('GET /users error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
