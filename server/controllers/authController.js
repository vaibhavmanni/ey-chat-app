// server/controllers/authController.js
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { validateRegister, validateLogin } = require('../helpers/validation');
const { generateToken } = require('../helpers/jwt');

exports.register = async (req, res) => {
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

    // 4) Strip hash before sending
    const safe = user.toJSON();
    delete safe.passwordHash;
    res.status(201).json(safe);

  } catch (err) {
    console.error('Registration error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  // 1) Validate payload
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message),
    });
  }
  const { username, password } = value;

  try {
    // 2) Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // 3) Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // 4) Issue token
    const token = generateToken({ id: user.id });
    res.json({ token });

  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
