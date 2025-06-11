// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { validateRegister, validateLogin } = require('../helpers/validation');
const { generateToken } = require('../helpers/jwt');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  // 1) Validate payload
  const { error, value } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message),
    });
  }

  const { username, password, firstName, lastName, email } = value;

  try {
    // 2) Check duplicate
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // 3) Hash & create
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, firstName, lastName, email });

    const safe = user.toJSON();
    delete safe.passwordHash;
    res.status(201).json(safe);
  } catch (err) {
    console.error('Registration error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message),
    });
  }

  const { username, password } = value;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id });
    res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
