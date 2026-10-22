const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'Please log in first.' });
  try {
    req.userId = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};
