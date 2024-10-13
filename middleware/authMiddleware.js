import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import config from '../config.js';

dotenv.config();

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // Attach user details to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeUser = (req, res, next) => {
  if (req.user.accountType !== 'user') {
    return res.status(403).json({ message: 'Access denied. User accounts only.' });
  }
  next();
};

export const authorizeEmployee = (req, res, next) => {
  if (req.user.accountType !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Employee accounts only.' });
  }
  next();
};