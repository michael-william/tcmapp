/**
 * Migration Routes
 *
 * CRUD operations for migration projects and question management.
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Migration = require('../models/Migration');
const User = require('../models/User');
const { requireAuth, requireInterWorks } = require('../middleware/auth');
const questionTemplate = require('../seeds/questionTemplate');

const router = express.Router();

/**
 * POST /api/migrations
 * Create new migration (InterWorks only)
 */
router.post(
  '/',
  requireAuth,
  requireInterWorks,
  [
    body('clientEmail')
      .isEmail()
      .withMessage('Valid client email is required')
      .normalizeEmail(),
    body('clientInfo').optional().isObject(),
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

      const { clientEmail, clientInfo } = req.body;

      // Check if client user exists
      const clientUser = await User.findOne({ email: clientEmail });
      if (!clientUser) {
        return res.status(404).json({
          success: false,
          message: 'Client user not found. Please create the user first.',
        });
      }

      // Check if migration already exists for this client
      const existingMigration = await Migration.findOne({ clientEmail });
      if (existingMigration) {
        return res.status(400).json({
          success: false,
          message: 'Migration already exists for this client.',
        });
      }

      // Create migration with question template
      const migration = await Migration.create({
        clientEmail,
        clientInfo: clientInfo || {},
        questions: questionTemplate,
        createdBy: req.user.email,
      });

      res.status(201).json({
        success: true,
        message: 'Migration created successfully.',
        migration,
      });
    } catch (error) {
      console.error('Create migration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create migration.',
      });
    }
  }
);

/**
 * GET /api/migrations
 * List all migrations (filtered by role)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { clientEmail, section } = req.query;

    // Build query
    let query = {};

    // Clients can only see their own migration
    if (req.user.role === 'client') {
      query.clientEmail = req.user.email;
    } else if (clientEmail) {
      // InterWorks can filter by client email
      query.clientEmail = clientEmail;
    }

    const migrations = await Migration.find(query)
      .sort({ updatedAt: -1 })
      .select('-questions'); // Exclude questions for list view (performance)

    // Calculate progress for each migration
    const migrationsWithProgress = await Promise.all(
      migrations.map(async (migration) => {
        const fullMigration = await Migration.findById(migration._id);
        const progress = fullMigration.calculateProgress();
        return {
          ...migration.toObject(),
          progress,
        };
      })
    );

    res.json({
      success: true,
      migrations: migrationsWithProgress,
      count: migrationsWithProgress.length,
    });
  } catch (error) {
    console.error('List migrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve migrations.',
    });
  }
});

/**
 * GET /api/migrations/:id
 * Get single migration by ID
 */
router.get('/:id', requireAuth, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const migration = await Migration.findById(req.params.id);

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: 'Migration not found.',
      });
    }

    // Check access: clients can only view their own migration
    if (req.user.role === 'client' && migration.clientEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own migration.',
      });
    }

    const progress = migration.calculateProgress();

    res.json({
      success: true,
      migration: {
        ...migration.toObject(),
        progress,
      },
    });
  } catch (error) {
    console.error('Get migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve migration.',
    });
  }
});

/**
 * PUT /api/migrations/:id
 * Update migration (clientInfo, questions, notes)
 */
router.put('/:id', requireAuth, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const migration = await Migration.findById(req.params.id);

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: 'Migration not found.',
      });
    }

    // Check access: clients can only update their own migration
    if (req.user.role === 'client' && migration.clientEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own migration.',
      });
    }

    const { clientInfo, questions, additionalNotes } = req.body;

    // Update allowed fields
    if (clientInfo) {
      migration.clientInfo = { ...migration.clientInfo, ...clientInfo };
    }

    if (questions) {
      migration.questions = questions;
    }

    if (additionalNotes !== undefined) {
      migration.additionalNotes = additionalNotes;
    }

    await migration.save();

    const progress = migration.calculateProgress();

    res.json({
      success: true,
      message: 'Migration updated successfully.',
      migration: {
        ...migration.toObject(),
        progress,
      },
    });
  } catch (error) {
    console.error('Update migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update migration.',
    });
  }
});

/**
 * DELETE /api/migrations/:id
 * Delete migration (InterWorks only)
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

      const migration = await Migration.findByIdAndDelete(req.params.id);

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      res.json({
        success: true,
        message: 'Migration deleted successfully.',
      });
    } catch (error) {
      console.error('Delete migration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete migration.',
      });
    }
  }
);

/**
 * PUT /api/migrations/:id/questions/reorder
 * Reorder questions (InterWorks only)
 * IMPORTANT: Must come before /:questionId routes to avoid path conflict
 */
router.put(
  '/:id/questions/reorder',
  requireAuth,
  requireInterWorks,
  [param('id').isMongoId(), body('questionIds').isArray().withMessage('questionIds must be an array')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const migration = await Migration.findById(req.params.id);

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      const { questionIds } = req.body;

      // Validate all question IDs exist
      const existingIds = migration.questions.map((q) => q.id);
      const invalidIds = questionIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid question IDs: ${invalidIds.join(', ')}`,
        });
      }

      // Reorder questions
      questionIds.forEach((id, index) => {
        const question = migration.questions.find((q) => q.id === id);
        if (question) {
          question.order = index + 1;
        }
      });

      // Sort by new order
      migration.questions.sort((a, b) => a.order - b.order);

      await migration.save();

      res.json({
        success: true,
        message: 'Questions reordered successfully.',
        migration,
      });
    } catch (error) {
      console.error('Reorder questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder questions.',
      });
    }
  }
);

/**
 * POST /api/migrations/:id/questions
 * Add question to migration (InterWorks only)
 */
router.post(
  '/:id/questions',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId(),
    body('section').notEmpty().withMessage('Section is required'),
    body('questionText').notEmpty().withMessage('Question text is required'),
    body('questionType')
      .isIn(['checkbox', 'textInput', 'dateInput', 'dropdown', 'yesNo'])
      .withMessage('Invalid question type'),
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

      const migration = await Migration.findById(req.params.id);

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      const { section, questionText, questionType, options, metadata } = req.body;

      // Generate new question ID
      const maxOrder = Math.max(...migration.questions.map((q) => q.order), 0);
      const newQuestionId = `q${migration.questions.length + 1}`;

      const newQuestion = {
        id: newQuestionId,
        section,
        questionText,
        questionType: questionType || 'checkbox',
        options: options || [],
        answer: null,
        completed: false,
        order: maxOrder + 1,
        metadata: metadata || {},
      };

      migration.questions.push(newQuestion);
      await migration.save();

      res.status(201).json({
        success: true,
        message: 'Question added successfully.',
        migration,
      });
    } catch (error) {
      console.error('Add question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add question.',
      });
    }
  }
);

/**
 * PUT /api/migrations/:id/questions/:questionId
 * Edit question (InterWorks only)
 */
router.put(
  '/:id/questions/:questionId',
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

      const migration = await Migration.findById(req.params.id);

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      const questionIndex = migration.questions.findIndex(
        (q) => q.id === req.params.questionId
      );

      if (questionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Question not found.',
        });
      }

      // Update question fields
      const allowedFields = [
        'section',
        'questionText',
        'questionType',
        'options',
        'metadata',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          migration.questions[questionIndex][field] = req.body[field];
        }
      });

      await migration.save();

      res.json({
        success: true,
        message: 'Question updated successfully.',
        migration,
      });
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update question.',
      });
    }
  }
);

/**
 * DELETE /api/migrations/:id/questions/:questionId
 * Remove question (InterWorks only)
 */
router.delete(
  '/:id/questions/:questionId',
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

      const migration = await Migration.findById(req.params.id);

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      const questionIndex = migration.questions.findIndex(
        (q) => q.id === req.params.questionId
      );

      if (questionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Question not found.',
        });
      }

      // Remove question
      migration.questions.splice(questionIndex, 1);

      // Reorder remaining questions
      migration.questions.forEach((q, index) => {
        q.order = index + 1;
      });

      await migration.save();

      res.json({
        success: true,
        message: 'Question deleted successfully.',
        migration,
      });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete question.',
      });
    }
  }
);

module.exports = router;
