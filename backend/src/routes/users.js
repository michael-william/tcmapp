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
    body('clientIds')
      .optional()
      .isArray()
      .withMessage('clientIds must be an array'),
    body('clientIds.*')
      .isMongoId()
      .withMessage('Each clientId must be a valid MongoDB ID'),
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

      const { email, name, clientIds, role } = req.body;
      let { password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      // Validate guest users have at least one client
      if (role === 'guest' && (!clientIds || clientIds.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Guest users must be assigned to at least one client.',
        });
      }

      // Validate that all clients exist
      if (clientIds && clientIds.length > 0) {
        const clients = await Client.find({ _id: { $in: clientIds } });
        if (clients.length !== clientIds.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more clients not found. Please verify all client IDs.',
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
        clientIds: clientIds || [], // Default to empty array
      });

      // Populate clientIds if they exist
      if (user.clientIds && user.clientIds.length > 0) {
        user = await User.findById(user._id).populate('clientIds', 'name email');
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
      query.clientIds = clientId;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .populate('clientIds', 'name email');

    // Get migration count for each guest user's clients
    const usersWithMigrations = await Promise.all(
      users.map(async (user) => {
        let migrationCount = 0;
        if (user.role === 'guest' && user.clientIds && user.clientIds.length > 0) {
          const clientIdArray = user.clientIds.map(c => c._id);
          migrationCount = await Migration.countDocuments({
            clientId: { $in: clientIdArray },
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

      const user = await User.findById(req.params.id).populate('clientIds', 'name email');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Get migrations for this user's clients (if guest)
      let migrations = [];
      if (user.role === 'guest' && user.clientIds && user.clientIds.length > 0) {
        const clientIdArray = user.clientIds.map(c => c._id);
        migrations = await Migration.find({
          clientId: { $in: clientIdArray },
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
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['interworks', 'guest']).withMessage('Role must be interworks or guest'),
    body('clientIds').optional().isArray().withMessage('clientIds must be an array'),
    body('clientIds.*').isMongoId().withMessage('Each clientId must be a valid MongoDB ID'),
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

      const { name, email, password, role, clientIds } = req.body;

      // Check email uniqueness if changing email
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists.',
          });
        }
      }

      // Validate all clients exist if clientIds provided
      if (clientIds) {
        const clients = await Client.find({ _id: { $in: clientIds } });
        if (clients.length !== clientIds.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more clients not found. Please verify all client IDs.',
          });
        }
      }

      // Determine final role
      const finalRole = role !== undefined ? role : user.role;

      // Validate guest users have at least one client
      const finalClientIds = clientIds !== undefined ? clientIds : user.clientIds || [];
      if (finalRole === 'guest' && finalClientIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Guest users must be assigned to at least one client.',
        });
      }

      // Update allowed fields
      if (name !== undefined) {
        user.name = name;
      }

      if (email !== undefined) {
        user.email = email;
      }

      if (password) {
        user.passwordHash = password;
      }

      if (role !== undefined) {
        user.role = role;
        // If changing to InterWorks, clear clientIds (unless explicitly provided)
        if (role === 'interworks' && clientIds === undefined) {
          user.clientIds = [];
        }
      }

      if (clientIds !== undefined) {
        user.clientIds = clientIds;
      }

      await user.save();

      // Populate clientIds for response
      const updatedUser = await User.findById(user._id).populate('clientIds', 'name email');

      res.json({
        success: true,
        message: 'User updated successfully.',
        user: updatedUser.toJSON(),
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

      // Always warn when deleting users (both InterWorks and guest)
      const force = req.query.force === 'true';
      if (!force) {
        let message;
        let migrationCount = 0;

        if (user.role === 'interworks') {
          migrationCount = await Migration.countDocuments({ createdBy: user.email });
          message = migrationCount > 0
            ? `This InterWorks user has created ${migrationCount} migration(s). Deleting will not affect migrations, but audit trail will be preserved.`
            : 'This is an InterWorks user with administrative privileges. Are you sure you want to delete this user?';
        } else if (user.role === 'guest') {
          // For guest users, check their assigned clients and migrations
          const clientCount = user.clientIds?.length || 0;
          if (clientCount > 0) {
            migrationCount = await Migration.countDocuments({
              clientId: { $in: user.clientIds },
            });
          }

          message = clientCount > 0
            ? `This guest user has access to ${clientCount} client(s) with ${migrationCount} migration(s). Are you sure you want to delete this user?`
            : 'Are you sure you want to delete this guest user?';
        }

        return res.status(409).json({
          success: false,
          error: 'Confirmation required',
          message,
          migrationCount,
          requiresForce: true,
        });
      }

      // Proceed with deletion
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
