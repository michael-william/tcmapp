/**
 * Authentication Middleware
 *
 * JWT verification and user authentication middleware.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH] Token verified for user: ${decoded.email} (${decoded.role})`);
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      clientIds: user.clientIds || [], // Array of client IDs for guest users
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AUTH ERROR] ${error.name}: ${error.message}`);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

/**
 * Require InterWorks role
 */
const requireInterWorks = (req, res, next) => {
  if (req.user.role !== 'interworks') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This action requires InterWorks permissions.',
    });
  }
  next();
};

/**
 * Require guest role
 */
const requireGuest = (req, res, next) => {
  if (req.user.role !== 'guest') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This action requires guest permissions.',
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireInterWorks,
  requireGuest,
};
