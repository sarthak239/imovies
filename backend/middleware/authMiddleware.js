const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const store = require('../config/store');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_skillwallet_2026'
      );

      // Check Mongoose User or Admin
      let foundUser = null;
      try {
        foundUser = await User.findById(decoded.id).select('-password');
        if (!foundUser) {
          foundUser = await Admin.findById(decoded.id).select('-password');
        }
      } catch (err) {
        // Fallback store
      }

      if (!foundUser) {
        // Check in-memory store
        const u = store.users.find(x => x._id === decoded.id || x.email === decoded.email);
        if (u) {
          foundUser = {
            _id: u._id,
            id: u._id,
            username: u.username,
            name: u.name || u.username,
            email: u.email,
            role: u.role || 'user',
          };
        } else {
          const a = store.admins.find(x => x._id === decoded.id || x.email === decoded.email);
          if (a) {
            foundUser = {
              _id: a._id,
              id: a._id,
              username: a.username,
              name: a.username,
              email: a.email,
              role: 'admin',
            };
          }
        }
      }

      if (!foundUser) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User or Admin session no longer exists',
        });
      }

      req.user = foundUser;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized: No Bearer token provided',
  });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required',
  });
};

module.exports = { protect, admin };
