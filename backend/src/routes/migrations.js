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
        hasManagement: !!migrationObj.managementModule?.enabled,
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
      const transformedQuestions = questions.map(transformQuestionForBackend);

      // Track who updated each question and when
      migration.questions = transformedQuestions.map((incomingQ) => {
        const existingQ = migration.questions.find(q => q.id === incomingQ.id);

        // If question exists, check if answer or other fields changed
        if (existingQ) {
          const answerChanged = JSON.stringify(existingQ.answer) !== JSON.stringify(incomingQ.answer);
          const completedChanged = existingQ.completed !== incomingQ.completed;

          // Check if question is being cleared (un-answered)
          const isBeingCleared =
            incomingQ.completed === false &&
            (incomingQ.answer === null || incomingQ.answer === undefined || incomingQ.answer === '');

          if (isBeingCleared) {
            // Clear tracking fields when answer is removed
            incomingQ.updatedBy = null;
            incomingQ.updatedAt = null;
          } else if (answerChanged || completedChanged) {
            // Set tracking fields when answer changes
            incomingQ.updatedBy = req.user.email;
            incomingQ.updatedAt = new Date();
          } else {
            // Preserve existing tracking data if no changes
            incomingQ.updatedBy = existingQ.updatedBy;
            incomingQ.updatedAt = existingQ.updatedAt;
          }
        } else {
          // New question - set initial tracking data if it has an answer
          if (incomingQ.answer !== null && incomingQ.answer !== undefined && incomingQ.answer !== '') {
            incomingQ.updatedBy = req.user.email;
            incomingQ.updatedAt = new Date();
          }
        }

        return incomingQ;
      });
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

      // Track who modified this question and when (for InterWorks edits to question structure)
      migration.questions[questionIndex].updatedBy = req.user.email;
      migration.questions[questionIndex].updatedAt = new Date();

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

      // ========== STEP 1: Validate question template ==========
      const { validateManagementQuestions } = require('../utils/validateManagementQuestions');
      const validation = validateManagementQuestions();

      if (!validation.valid) {
        console.error('[ENABLE] Template validation failed:', validation.errors);
        return res.status(500).json({
          success: false,
          error: 'TEMPLATE_VALIDATION_FAILED',
          message: 'Management question template is invalid.',
          details: validation.errors,
        });
      }

      console.log(`[ENABLE] Template validated: ${validation.questions.length} questions`);
      const clonedQuestions = JSON.parse(JSON.stringify(validation.questions));

      // ========== STEP 2: Single atomic operation - set entire managementModule ==========
      const updated = await Migration.findOneAndUpdate(
        {
          _id: req.params.id,
          $or: [
            { 'managementModule.enabled': { $exists: false } },
            { 'managementModule.enabled': false },
          ],
        },
        {
          $set: {
            'managementModule.enabled': true,
            'managementModule.createdAt': new Date(),
            'managementModule.createdBy': req.user.email,
            'managementModule.questions': clonedQuestions,
            'managementModule.weeklyNotes': [],
          },
        },
        { new: true, runValidators: true }
      );

      // ========== STEP 3: Verify operation succeeded ==========
      if (!updated) {
        console.error('[ENABLE] Migration not found or already enabled');
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND_OR_ENABLED',
          message: 'Migration not found or management module is already enabled.',
        });
      }

      console.log(
        `[ENABLE] Management module enabled with ${updated.managementModule.questions?.length || 0} questions`
      );

      // ========== STEP 4: Return success ==========
      const migrationObj = updated.toObject();
      res.status(200).json({
        success: true,
        message: `Management module enabled successfully with ${clonedQuestions.length} questions`,
        migration: {
          ...migrationObj,
          hasManagement: true,
        },
      });
    } catch (error) {
      console.error('[ENABLE] Error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Question validation failed',
          details: error.errors,
        });
      }

      res.status(500).json({
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'Failed to enable management module',
        details: error.message,
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

      // Get management questions from managementModule
      const managementQuestions = migration.managementModule.questions || [];

      // Prepare response data
      const managementData = {
        clientInfo: migration.clientInfo,
        progress,
        weeklyNotes: migration.managementModule.weeklyNotes || [],
        questions: managementQuestions,
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
 * PUT /api/migrations/:id/management/questions/:questionId
 * Update single management question
 */
router.put(
  '/:id/management/questions/:questionId',
  requireAuth,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('questionId').notEmpty().withMessage('Question ID is required'),
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

      // Access control
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { questionId } = req.params;
      const updates = req.body;

      console.log(`[QUESTION UPDATE] Updating question ${questionId}:`, updates);

      // Find and update question
      const question = migration.managementModule.questions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found.',
        });
      }

      // Apply updates
      if (updates.answer !== undefined) question.answer = updates.answer;
      if (updates.completed !== undefined) question.completed = updates.completed;
      if (updates.completedAt !== undefined) question.completedAt = updates.completedAt;

      // Track update
      question.updatedBy = req.user.email;
      question.updatedAt = new Date();

      await migration.save();

      console.log(`[QUESTION UPDATE] Successfully saved question ${questionId}`);

      res.json({
        success: true,
        question,
      });
    } catch (error) {
      console.error('[QUESTION UPDATE] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update question.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * PUT /api/migrations/:id/management/batch-update
 * Batch update all management questions (optimized for manual save)
 */
router.put(
  '/:id/management/batch-update',
  requireAuth,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    body('questions').isArray().withMessage('Questions array is required'),
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

      // Access control
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { questions } = req.body;
      let updateCount = 0;

      console.log(`[BATCH UPDATE] Processing ${questions.length} questions`);

      // Update each question that exists
      questions.forEach((updatedQuestion) => {
        const question = migration.managementModule.questions.find(
          (q) => q.id === updatedQuestion.id
        );

        if (question) {
          let hasChanges = false;

          // Update fields that clients/interworks can modify - only if changed
          if (updatedQuestion.answer !== undefined && question.answer !== updatedQuestion.answer) {
            question.answer = updatedQuestion.answer;
            hasChanges = true;
          }
          if (updatedQuestion.completed !== undefined && question.completed !== updatedQuestion.completed) {
            question.completed = updatedQuestion.completed;
            hasChanges = true;
          }
          if (updatedQuestion.completedAt !== undefined) {
            const existingTime = question.completedAt ? new Date(question.completedAt).getTime() : null;
            const newTime = updatedQuestion.completedAt ? new Date(updatedQuestion.completedAt).getTime() : null;
            if (existingTime !== newTime) {
              question.completedAt = updatedQuestion.completedAt;
              hasChanges = true;
            }
          }

          // Update delta fields if present - check if actually changed
          if (updatedQuestion.deltas !== undefined) {
            const existingDeltas = JSON.stringify(question.deltas || []);
            const newDeltas = JSON.stringify(updatedQuestion.deltas || []);
            if (existingDeltas !== newDeltas) {
              question.deltas = updatedQuestion.deltas;
              hasChanges = true;
            }
          }

          // Only track update if something actually changed
          if (hasChanges) {
            question.updatedBy = req.user.email;
            question.updatedAt = new Date();
            updateCount++;
          }
        }
      });

      await migration.save();

      console.log(`[BATCH UPDATE] Successfully updated ${updateCount} questions`);

      // Return full management data
      const managementData = {
        clientInfo: migration.clientInfo,
        questions: migration.managementModule.questions,
        weeklyNotes: migration.managementModule.weeklyNotes || [],
        progress: {
          completed: migration.managementModule.questions.filter(
            (q) => q.questionType !== 'deltaParent' && q.completed
          ).length,
          total: migration.managementModule.questions.filter(
            (q) => q.questionType !== 'deltaParent'
          ).length,
        },
      };

      res.json({
        success: true,
        message: `Updated ${updateCount} questions`,
        management: managementData,
      });
    } catch (error) {
      console.error('[BATCH UPDATE] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save changes.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * POST /api/migrations/:id/management/questions/:parentId/deltas
 * Add delta item to a delta parent question
 */
router.post(
  '/:id/management/questions/:parentId/deltas',
  requireAuth,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('parentId').notEmpty().withMessage('Parent question ID is required'),
    body('name').optional().trim(),
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

      // Access control
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { parentId } = req.params;
      const { name } = req.body;

      // Find parent question
      const parentQuestion = migration.managementModule.questions.find(q => q.id === parentId);
      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Parent question not found.',
        });
      }

      if (parentQuestion.questionType !== 'deltaParent') {
        return res.status(400).json({
          success: false,
          message: 'Question is not a delta parent.',
        });
      }

      // Initialize deltas array if needed
      if (!parentQuestion.deltas) {
        parentQuestion.deltas = [];
      }

      // Create new delta using template
      const template = parentQuestion.metadata?.deltaTemplate || {};
      const newDelta = {
        id: `delta-${Date.now()}`,
        name: name || `Item ${parentQuestion.deltas.length + 1}`,
        fields: {
          runbook: template.runbook || '',
          migrated: template.migrated || null,
          owner: template.owner || null,
          date: template.date || null,
          notes: template.notes || '',
          complete: template.complete || false,
        },
        createdBy: req.user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      parentQuestion.deltas.push(newDelta);
      await migration.save();

      console.log(`[DELTA ADD] Added delta ${newDelta.id} to parent ${parentId}`);

      res.status(201).json({
        success: true,
        delta: newDelta,
      });
    } catch (error) {
      console.error('[DELTA ADD] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add delta item.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * PUT /api/migrations/:id/management/questions/:parentId/deltas/:deltaId
 * Update delta item
 */
router.put(
  '/:id/management/questions/:parentId/deltas/:deltaId',
  requireAuth,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('parentId').notEmpty().withMessage('Parent question ID is required'),
    param('deltaId').notEmpty().withMessage('Delta ID is required'),
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

      // Access control
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { parentId, deltaId } = req.params;
      const updates = req.body;

      // Find parent question
      const parentQuestion = migration.managementModule.questions.find(q => q.id === parentId);
      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Parent question not found.',
        });
      }

      // Find delta
      const delta = parentQuestion.deltas?.find(d => d.id === deltaId);
      if (!delta) {
        return res.status(404).json({
          success: false,
          message: 'Delta item not found.',
        });
      }

      // Apply updates
      if (updates.name !== undefined) delta.name = updates.name;
      if (updates.fields) {
        delta.fields = { ...delta.fields, ...updates.fields };
      }

      delta.updatedAt = new Date();

      await migration.save();

      console.log(`[DELTA UPDATE] Updated delta ${deltaId} in parent ${parentId}`);

      res.json({
        success: true,
        delta,
      });
    } catch (error) {
      console.error('[DELTA UPDATE] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update delta item.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * DELETE /api/migrations/:id/management/questions/:parentId/deltas/:deltaId
 * Remove delta item
 */
router.delete(
  '/:id/management/questions/:parentId/deltas/:deltaId',
  requireAuth,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('parentId').notEmpty().withMessage('Parent question ID is required'),
    param('deltaId').notEmpty().withMessage('Delta ID is required'),
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

      // Access control
      if (req.user.role === 'client') {
        if (migration.clientId._id.toString() !== req.user.clientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied.',
          });
        }
      }

      // Check if management module is enabled
      if (!migration.managementModule?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'Management module is not enabled for this migration.',
        });
      }

      const { parentId, deltaId } = req.params;

      // Find parent question
      const parentQuestion = migration.managementModule.questions.find(q => q.id === parentId);
      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Parent question not found.',
        });
      }

      // Remove delta
      const deltaIndex = parentQuestion.deltas?.findIndex(d => d.id === deltaId);
      if (deltaIndex === -1 || deltaIndex === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Delta item not found.',
        });
      }

      parentQuestion.deltas.splice(deltaIndex, 1);
      await migration.save();

      console.log(`[DELTA DELETE] Removed delta ${deltaId} from parent ${parentId}`);

      res.json({
        success: true,
        message: 'Delta item removed successfully.',
      });
    } catch (error) {
      console.error('[DELTA DELETE] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove delta item.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

/**
 * POST /api/migrations/:id/management/delta
 * Add delta item to a section (InterWorks only)
 */
router.post(
  '/:id/management/delta',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    body('parentId').notEmpty().withMessage('Parent question ID is required'),
    body('sectionName').notEmpty().withMessage('Section name is required'),
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

      const { parentId, sectionName } = req.body;

      // Find parent question
      const parentQuestion = migration.questions.find(q => q.id === parentId);

      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Parent question not found.',
        });
      }

      // Verify parent is a delta parent
      if (!parentQuestion.metadata?.isDeltaParent) {
        return res.status(400).json({
          success: false,
          message: 'Parent question does not support delta items.',
        });
      }

      // Count existing deltas for this parent to generate index
      const existingDeltas = migration.questions.filter(
        q => q.metadata?.parentDeltaId === parentId
      );
      const deltaIndex = existingDeltas.length + 1;

      // Generate unique ID for new delta
      const deltaId = `${parentId}-delta-${Date.now()}`;

      // Create new delta question
      const newDelta = {
        id: deltaId,
        section: sectionName,
        questionText: `Added: Item ${deltaIndex}`,
        questionType: 'delta',
        answer: null,
        completed: false,
        order: parentQuestion.order + deltaIndex,
        metadata: {
          isManagementQuestion: true,
          isDelta: true,
          parentDeltaId: parentId,
          deltaIndex,
          deltaFields: {
            runbook: '',
            migrated: null,
            owner: null,
            date: null,
            notes: '',
            complete: false
          }
        }
      };

      // Add delta question after parent
      const parentIndex = migration.questions.findIndex(q => q.id === parentId);
      migration.questions.splice(parentIndex + 1 + existingDeltas.length, 0, newDelta);

      await migration.save();

      res.status(201).json({
        success: true,
        message: 'Delta item added successfully',
        delta: newDelta,
      });
    } catch (error) {
      console.error('Add delta error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add delta item.',
      });
    }
  }
);

/**
 * DELETE /api/migrations/:id/management/delta/:deltaId
 * Remove delta item (InterWorks only)
 */
router.delete(
  '/:id/management/delta/:deltaId',
  requireAuth,
  requireInterWorks,
  [
    param('id').isMongoId().withMessage('Valid migration ID is required'),
    param('deltaId').notEmpty().withMessage('Valid delta ID is required'),
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

      const { deltaId } = req.params;

      // Find delta question
      const deltaIndex = migration.questions.findIndex(q => q.id === deltaId);

      if (deltaIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Delta item not found.',
        });
      }

      const deltaQuestion = migration.questions[deltaIndex];

      // Verify it's a delta
      if (!deltaQuestion.metadata?.isDelta) {
        return res.status(400).json({
          success: false,
          message: 'Question is not a delta item.',
        });
      }

      // Remove delta question
      migration.questions.splice(deltaIndex, 1);

      await migration.save();

      res.status(200).json({
        success: true,
        message: 'Delta item deleted successfully',
      });
    } catch (error) {
      console.error('Delete delta error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete delta item.',
      });
    }
  }
);

module.exports = router;
