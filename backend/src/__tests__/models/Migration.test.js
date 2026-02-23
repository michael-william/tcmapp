/**
 * Migration Model Tests
 *
 * Tests for the Migration model including validation, methods, and question structure.
 */

const Migration = require('../../models/Migration');
const Client = require('../../models/Client');
const questionTemplate = require('../../seeds/questionTemplate');

describe('Migration Model', () => {
  let client;

  beforeEach(async () => {
    // Create a test client for migrations
    client = await Client.create({
      name: 'Test Client',
      email: 'client@company.com',
    });
  });

  describe('Migration Creation', () => {
    it('should create a migration with valid data', async () => {
      const migrationData = {
        clientId: client._id,
        clientInfo: {
          clientName: 'Acme Corp',
          region: 'US-West',
          serverVersion: '2023.3',
          serverUrl: 'https://tableau.acme.com',
          kickoffDate: new Date('2024-02-01'),
          primaryContact: 'John Doe',
          meetingCadence: 'Weekly',
          goLiveDate: new Date('2024-06-01'),
        },
        questions: questionTemplate,
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);

      expect(migration.clientId.toString()).toBe(client._id.toString());
      expect(migration.clientInfo.clientName).toBe('Acme Corp');
      expect(migration.questions).toHaveLength(64); // 64 questions in template
      expect(migration.createdBy).toBe('consultant@interworks.com');
      expect(migration.createdAt).toBeDefined();
      expect(migration.updatedAt).toBeDefined();
    });

    it('should lowercase createdBy email', async () => {
      const migrationData = {
        clientId: client._id,
        clientInfo: {
          clientName: 'Test Corp',
        },
        questions: [],
        createdBy: 'Consultant@InterWorks.COM',
      };

      const migration = await Migration.create(migrationData);
      expect(migration.createdBy).toBe('consultant@interworks.com');
    });

    it('should default additionalNotes to empty string', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      expect(migration.additionalNotes).toBe('');
    });
  });

  describe('Validation', () => {
    it('should fail without clientId', async () => {
      const migrationData = {
        questions: [],
        createdBy: 'consultant@interworks.com',
      };

      await expect(Migration.create(migrationData)).rejects.toThrow();
    });

    it('should fail without createdBy', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [],
      };

      await expect(Migration.create(migrationData)).rejects.toThrow();
    });
  });

  describe('Question Structure', () => {
    it('should store questions with correct schema', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question?',
            questionType: 'checkbox',
            answer: null,
            completed: false,
            order: 1,
            metadata: {
              isFullWidth: false,
            },
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Detailed question?',
            questionType: 'textInput',
            answer: 'Some answer',
            completed: true,
            timestamp: new Date(),
            order: 2,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);

      expect(migration.questions).toHaveLength(2);
      expect(migration.questions[0].id).toBe('q1');
      expect(migration.questions[0].questionType).toBe('checkbox');
      expect(migration.questions[1].questionType).toBe('textInput');
      expect(migration.questions[1].answer).toBe('Some answer');
      expect(migration.questions[1].completed).toBe(true);
    });

    it('should default questionType to checkbox', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question?',
            answer: null,
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      expect(migration.questions[0].questionType).toBe('checkbox');
    });

    it('should validate questionType enum', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question?',
            questionType: 'invalid-type',
            answer: null,
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      await expect(Migration.create(migrationData)).rejects.toThrow();
    });

    it('should store dropdown options', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Tableau Cloud',
            questionText: 'Select SKU type',
            questionType: 'dropdown',
            options: ['Standard', 'Enterprise', 'Tableau +'],
            answer: null,
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      expect(migration.questions[0].options).toEqual(['Standard', 'Enterprise', 'Tableau +']);
    });

    it('should store question metadata', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question?',
            questionType: 'checkbox',
            answer: null,
            completed: false,
            order: 1,
            metadata: {
              isFullWidth: true,
              hasConditionalInput: true,
              conditionalText: 'Additional details',
              infoTooltip: 'This is a tooltip',
            },
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      expect(migration.questions[0].metadata.isFullWidth).toBe(true);
      expect(migration.questions[0].metadata.hasConditionalInput).toBe(true);
      expect(migration.questions[0].metadata.conditionalText).toBe('Additional details');
      expect(migration.questions[0].metadata.infoTooltip).toBe('This is a tooltip');
    });
  });

  describe('calculateProgress Method', () => {
    it('should calculate progress correctly', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question 1',
            questionType: 'checkbox',
            answer: null,
            completed: true,
            order: 1,
            metadata: {},
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question 2',
            questionType: 'checkbox',
            answer: null,
            completed: true,
            order: 2,
            metadata: {},
          },
          {
            id: 'q3',
            section: 'Security',
            questionText: 'Question 3',
            questionType: 'checkbox',
            answer: null,
            completed: false,
            order: 3,
            metadata: {},
          },
          {
            id: 'q4',
            section: 'Security',
            questionText: 'Question 4',
            questionType: 'checkbox',
            answer: null,
            completed: false,
            order: 4,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      const progress = migration.calculateProgress();

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    it('should return 0% for no questions', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      const progress = migration.calculateProgress();

      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should return 100% when all questions completed', async () => {
      const migrationData = {
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question 1',
            questionType: 'checkbox',
            answer: null,
            completed: true,
            order: 1,
            metadata: {},
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question 2',
            questionType: 'checkbox',
            answer: null,
            completed: true,
            order: 2,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      };

      const migration = await Migration.create(migrationData);
      const progress = migration.calculateProgress();

      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('Question Template', () => {
    it('should have 64 questions in template', () => {
      expect(questionTemplate).toHaveLength(64);
    });

    it('should have all required fields in each question', () => {
      questionTemplate.forEach((question, index) => {
        expect(question.id).toBeDefined();
        expect(question.section).toBeDefined();
        expect(question.questionText).toBeDefined();
        expect(question.order).toBe(index + 1);
        expect(question.metadata).toBeDefined();
      });
    });

    it('should have correct sections', () => {
      const sections = [...new Set(questionTemplate.map((q) => q.section))];
      expect(sections).toContain('Security');
      expect(sections).toContain('Communications');
      expect(sections).toContain('Stakeholders');
      expect(sections).toContain('Access & Connectivity');
      expect(sections).toContain('Tableau Server');
      expect(sections).toContain('Pre Flight Checks');
      expect(sections).toContain('Tableau Cloud');
      expect(sections).toContain('Tableau Bridge');
      expect(sections).toContain('Cloud Data Sources');
    });

    it('should have correct question types', () => {
      const types = [...new Set(questionTemplate.map((q) => q.questionType))];
      expect(types).toContain('checkbox');
      expect(types).toContain('textInput');
      expect(types).toContain('dateInput');
      expect(types).toContain('dropdown');
      expect(types).toContain('yesNo');
    });
  });
});
