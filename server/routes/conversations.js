const express = require('express');
const { getConversations } = require('../controllers/conversationsController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/:userId', authMiddleware, getConversations);

module.exports = router;
