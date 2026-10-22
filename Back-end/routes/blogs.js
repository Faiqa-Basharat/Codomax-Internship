const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/blogs  (login required)
router.post('/', auth, async (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const content = (req.body.content || '').trim();
    if (!title || !content)
      return res.status(400).json({ message: 'Title and content are required.' });
    if (title.length > 120)
      return res.status(400).json({ message: 'Title must be 120 characters or less.' });

    const blog = await Blog.create({ title, content, author: req.userId });
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/blogs  (all blogs, newest first)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/blogs/:id  (one blog)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ message: 'Blog not found.' });
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
