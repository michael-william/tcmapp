/**
 * User Management Routes
 *
 * CRUD operations for user management (InterWorks only).
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const Client = require('../models/Client');
const Migration = require('../models/Migration');
const { requireAuth, requireInterWorks } = require('../middleware/auth');

const router = express.Router();

/**
 * Generate random password
 * @returns {string} Random password
 */
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

/**
 * POST /api/users
 * Create guest user (InterWorks only)
 */
router.post(
  '/',
  requireAuth,
  requireInterWorks,
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').optional().trim(),
    body('role').optional().isIn(['interworks', 'guest']).withMessage('Role must be interworks or guest'),
    body('clientId')
      .if(body('role').equals('guest'))
      .isMongoId()
      .withMessage('Valid client ID is required for guest users'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, name, clientId, role } = req.body;
      let { password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      // Validate that client exists (only for guest users or when clientId is provided)
      if (role === 'guest' || (!role && clientId) || clientId) {
        const client = await Client.findById(clientId);
        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client not found. Please create the client first.',
          });
        }
      }

      // Generate password if not provided
      const isPasswordGenerated = !password;
      if (!password) {
        password = generatePassword();
      }

      // Create user with dynamic role
      let user = await User.create({
        email,
        passwordHash: password,
        name,
        role: role || 'guest', // Default to guest for backward compatibility
        ...(clientId && { clientId }), // Only include if provided
      });

      // Populate clientId if it exists
      if (user.clientId) {
        user = await User.findById(user._id).populate('clientId', 'name email');
      }

      res.status(201).json({
        success: true,
        message: `${role === 'interworks' ? 'InterWorks' : 'Guest'} user created successfully.`,
        user: user.toJSON(),
        ...(isPasswordGenerated && { generatedPassword: password }),
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user.',
      });
    }
  }
);

/**
 * GET /api/users
 * List all users (InterWorks only)
 */
router.get('/', requireAuth, requireInterWorks, async (req, res) => {
  try {
    const { role, clientId } = req.query;

    // Build query
    let query = {};
    if (role) {
      query.role = role;
    }
    if (clientId) {
      query.clientId = clientId;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'name email');

    // Get migration count for each guest user's client
    const usersWithMigrations = await Promise.all(
      users.map(async (user) => {
        let migrationCount = 0;
        if (user.role === 'guest' && user.clientId) {
          migrationCount = await Migration.countDocuments({
            clientId: user.clientId._id,
          });
        }

        return {
          ...user.toJSON(),
          migrationCount,
        };
      })
    );

    res.json({
      success: true,
      users: usersWithMigrations,
      count: usersWithMigrations.length,
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
    });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID (InterWorks only)
 */
router.get(
  '/:id',
  requireAuth,
  requireInterWorks,
  param('id').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.id).populate('clientId', 'name email');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Get migrations for this user's client (if guest)
      let migrations = [];
      if (user.role === 'guest' && user.clientId) {
        migrations = await Migration.find({
          clientId: user.clientId._id,
        }).select('_id clientInfo.clientName createdAt');
      }

      res.json({
        success: true,
        user: user.toJSON(),
        migrations,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user.',
      });
    }
  }
);

/**
 * PUT /api/users/:id
 * Update user (InterWorks only)
 */
router.put(
  '/:id',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId(),
    body('name').optional().trim(),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      const { name, password } = req.body;

      // Update allowed fields
      if (name !== undefined) {
        user.name = name;
      }

      if (password) {
        user.passwordHash = password;
      }

      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully.',
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user.',
      });
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete user (InterWorks only)
 */
router.delete(
  '/:id',
  requireAuth,
  requireInterWorks,
  param('id').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Prevent deleting InterWorks users
      if (user.role === 'interworks') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete InterWorks users.',
        });
      }

      // Guest users can be deleted without checking migrations
      // (migrations belong to the client, not individual guest users)

      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully.',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user.',
      });
    }
  }
);

module.exports = router;
