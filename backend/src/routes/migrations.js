/**
 * Migration Routes
 *
 * CRUD operations for migration projects and question management.
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Migration = require('../models/Migration');
const Client = require('../models/Client');
const User = require('../models/User');
const { requireAuth, requireInterWorks } = require('../middleware/auth');
const questionTemplate = require('../seeds/questionTemplate');

const router = express.Router();

/**
 * Transform question data for frontend
 * Maps metadata.infoTooltip -> helpText
 */
const transformQuestionForFrontend = (question) => {
  const transformed = question.toObject ? question.toObject() : { ...question };
  if (transformed.metadata?.infoTooltip) {
    transformed.helpText = transformed.metadata.infoTooltip;
  }
  return transformed;
};

/**
 * Transform question data for backend
 * Maps helpText -> metadata.infoTooltip
 */
const transformQuestionForBackend = (question) => {
  const transformed = { ...question };
  if (transformed.helpText) {
    transformed.metadata = {
      ...(transformed.metadata || {}),
      infoTooltip: transformed.helpText,
    };
    delete transformed.helpText;
  }
  return transformed;
};

/**
 * POST /api/migrations
 * Create new migration (InterWorks only)
 */
router.post(
  '/',
  requireAuth,
  requireInterWorks,
  [
    body('clientId')
      .isMongoId()
      .withMessage('Valid client ID is required'),
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

      const { clientId, clientInfo } = req.body;

      // Check if client exists
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found. Please create the client first.',
        });
      }

      // Create migration with question template (no restriction on multiple migrations per client)
      const migration = await Migration.create({
        clientId,
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
    const { clientId, section } = req.query;

    // Build query
    let query = {};

    // Guests can only see migrations for their assigned clients
    if (req.user.role === 'guest') {
      query.clientId = { $in: req.user.clientIds };
    } else if (clientId) {
      // InterWorks can filter by client ID
      query.clientId = clientId;
    }

    const migrations = await Migration.find(query)
      .sort({ updatedAt: -1 })
      .select('-questions') // Exclude questions for list view (performance)
      .populate('clientId', 'name email');

    // Calculate progress for each migration
    const migrationsWithProgress = await Promise.all(
      migrations.map(async (migration) => {
        const fullMigration = await Migration.findById(migration._id);
        const progress = fullMigration.calculateProgress();
        const migrationObj = migration.toObject();

        // Transform questions if they exist
        if (fullMigration.questions) {
          migrationObj.questions = fullMigration.questions.map(transformQuestionForFrontend);
        }

        return {
          ...migrationObj,
          progress,
          hasManagement: !!fullMigration.managementModule?.enabled,
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

    const migration = await Migration.findById(req.params.id).populate('clientId', 'name email');

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: 'Migration not found.',
      });
    }

    // Check access: guests can only view migrations for their assigned clients
    if (req.user.role === 'guest') {
      const userClientIds = req.user.clientIds.map(id => id.toString());
      const migrationClientId = migration.clientId._id.toString();
      if (!userClientIds.includes(migrationClientId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view migrations for your assigned clients.',
        });
      }
    }

    const progress = migration.calculateProgress();
    const migrationObj = migration.toObject();

    // Transform questions for frontend
    if (migrationObj.questions) {
      migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
    }

    res.json({
      success: true,
      migration: {
        ...migrationObj,
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

    // Check access: guests can only update migrations for their assigned clients
    if (req.user.role === 'guest') {
      const userClientIds = req.user.clientIds.map(id => id.toString());
      const migrationClientId = migration.clientId.toString();
      if (!userClientIds.includes(migrationClientId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update migrations for your assigned clients.',
        });
      }
    }

    const { clientInfo, questions, additionalNotes } = req.body;

    // Update allowed fields
    if (clientInfo) {
      migration.clientInfo = { ...migration.clientInfo, ...clientInfo };
    }

    if (questions) {
      // Transform incoming questions from helpText to metadata.infoTooltip
      migration.questions = questions.map(transformQuestionForBackend);
    }

    if (additionalNotes !== undefined) {
      migration.additionalNotes = additionalNotes;
    }

    await migration.save();

    const progress = migration.calculateProgress();
    const migrationObj = migration.toObject();

    // Transform questions back to frontend format
    if (migrationObj.questions) {
      migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
    }

    res.json({
      success: true,
      message: 'Migration updated successfully.',
      migration: {
        ...migrationObj,
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

      const migrationObj = migration.toObject();

      // Transform questions for frontend
      if (migrationObj.questions) {
        migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
      }

      res.json({
        success: true,
        message: 'Questions reordered successfully.',
        migration: migrationObj,
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

      const { section, questionText, questionType, options, metadata, helpText } = req.body;

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

      // If helpText is provided, store it in metadata.infoTooltip
      if (helpText) {
        newQuestion.metadata.infoTooltip = helpText;
      }

      migration.questions.push(newQuestion);
      await migration.save();

      const migrationObj = migration.toObject();

      // Transform questions for frontend
      if (migrationObj.questions) {
        migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
      }

      res.status(201).json({
        success: true,
        message: 'Question added successfully.',
        migration: migrationObj,
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

      // If helpText is provided, store it in metadata.infoTooltip
      if (req.body.helpText !== undefined) {
        if (!migration.questions[questionIndex].metadata) {
          migration.questions[questionIndex].metadata = {};
        }
        migration.questions[questionIndex].metadata.infoTooltip = req.body.helpText;
      }

      await migration.save();

      const migrationObj = migration.toObject();

      // Transform questions for frontend
      if (migrationObj.questions) {
        migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
      }

      res.json({
        success: true,
        message: 'Question updated successfully.',
        migration: migrationObj,
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

      const migrationObj = migration.toObject();

      // Transform questions for frontend
      if (migrationObj.questions) {
        migrationObj.questions = migrationObj.questions.map(transformQuestionForFrontend);
      }

      res.json({
        success: true,
        message: 'Question deleted successfully.',
        migration: migrationObj,
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

/**
 * POST /api/migrations/:id/management/enable
 * Enable management module (InterWorks only, one-time)
 */
router.post(
  '/:id/management/enable',
  requireAuth,
  requireInterWorks,
  [param('id').isMongoId().withMessage('Valid migration ID is required')],
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

      // Check if already enabled
      if (migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is already enabled for this migration.',
        });
      }

      // Enable management module
      migration.managementModule = {
        enabled: true,
        createdAt: new Date(),
        createdBy: req.user.email,
        weeklyNotes: [],
      };

      await migration.save();

      res.status(200).json({
        success: true,
        message: 'Migration Management created successfully - You can now track weekly progress and add recap notes.',
        migration,
      });
    } catch (error) {
      console.error('Enable management module error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable management module.',
      });
    }
  }
);

/**
 * GET /api/migrations/:id/management
 * Get management data (both roles, filtered by access)
 */
router.get(
  '/:id/management',
  requireAuth,
  [param('id').isMongoId().withMessage('Valid migration ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const migration = await Migration.findById(req.params.id).populate('clientId');

      if (!migration) {
        return res.status(404).json({
          success: false,
          message: 'Migration not found.',
        });
      }

      // Access control: client users can only view their assigned migration
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view migrations for your assigned clients.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(404).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      // Calculate progress
      const progress = migration.calculateProgress();

      // Prepare response data
      const managementData = {
        clientInfo: migration.clientInfo,
        progress,
        weeklyNotes: migration.managementModule.weeklyNotes || [],
        createdAt: migration.managementModule.createdAt,
        createdBy: migration.managementModule.createdBy,
      };

      res.status(200).json({
        success: true,
        management: managementData,
      });
    } catch (error) {
      console.error('Get management data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve management data.',
      });
    }
  }
);

/**
 * POST /api/migrations/:id/management/notes
 * Add weekly note (InterWorks only)
 */
router.post(
  '/:id/management/notes',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    body('content').notEmpty().trim().withMessage('Note content is required'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
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

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(404).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { content, date } = req.body;

      // Add new note
      const newNote = {
        date: date ? new Date(date) : new Date(),
        content,
        createdBy: req.user.email,
        createdAt: new Date(),
      };

      migration.managementModule.weeklyNotes.push(newNote);
      await migration.save();

      res.status(201).json({
        success: true,
        message: 'Weekly note added successfully',
        note: migration.managementModule.weeklyNotes[migration.managementModule.weeklyNotes.length - 1],
      });
    } catch (error) {
      console.error('Add weekly note error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add weekly note.',
      });
    }
  }
);

/**
 * PUT /api/migrations/:id/management/notes/:noteId
 * Edit note (InterWorks only)
 */
router.put(
  '/:id/management/notes/:noteId',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('noteId').isMongoId().withMessage('Valid note ID is required'),
    body('content').optional().trim().notEmpty().withMessage('Note content cannot be empty'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
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

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(404).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      // Find the note
      const note = migration.managementModule.weeklyNotes.id(req.params.noteId);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found.',
        });
      }

      const { content, date } = req.body;

      // Update note fields
      if (content !== undefined) note.content = content;
      if (date !== undefined) note.date = new Date(date);
      note.updatedAt = new Date();

      await migration.save();

      res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        note,
      });
    } catch (error) {
      console.error('Edit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update note.',
      });
    }
  }
);

/**
 * DELETE /api/migrations/:id/management/notes/:noteId
 * Delete note (InterWorks only)
 */
router.delete(
  '/:id/management/notes/:noteId',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('noteId').isMongoId().withMessage('Valid note ID is required'),
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

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(404).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      // Find and remove the note using pull
      const noteExists = migration.managementModule.weeklyNotes.id(req.params.noteId);

      if (!noteExists) {
        return res.status(404).json({
          success: false,
          message: 'Note not found.',
        });
      }

      migration.managementModule.weeklyNotes.pull(req.params.noteId);
      await migration.save();

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete note.',
      });
    }
  }
);

module.exports = router;
