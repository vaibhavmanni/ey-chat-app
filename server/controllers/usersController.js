const { User } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'firstName', 'lastName',
        'email', 'createdAt', 'updatedAt'
      ]
    });
    res.json(users);
  } catch (err) {
    console.error('GET /users error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
