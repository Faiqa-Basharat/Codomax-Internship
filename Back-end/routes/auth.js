const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: 'An account with this email already exists. Try logging in.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      token: makeToken(user._id),
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: 'Email or password is incorrect. If you are new here, register first.' });

    res.json({
      token: makeToken(user._id),
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
