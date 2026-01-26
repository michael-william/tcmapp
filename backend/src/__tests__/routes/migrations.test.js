/**
 * Migration Routes Tests
 *
 * Integration tests for migration CRUD and question management endpoints.
 */

const request = require('supertest');
const express = require('express');
const migrationRoutes = require('../../routes/migrations');
const User = require('../../models/User');
const Migration = require('../../models/Migration');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/migrations', migrationRoutes);

describe('Migration Routes', () => {
  let interworksUser, interworksToken;
  let clientUser, clientToken;
  let migration;

  beforeEach(async () => {
    // Create InterWorks user
    interworksUser = await User.create({
      email: 'consultant@interworks.com',
      passwordHash: 'Password123!',
      name: 'Consultant',
      role: 'interworks',
    });

    interworksToken = generateJWT({
      userId: interworksUser._id.toString(),
      email: interworksUser.email,
      role: interworksUser.role,
    });

    // Create client user
    clientUser = await User.create({
      email: 'client@company.com',
      passwordHash: 'Password123!',
      name: 'Client User',
      role: 'client',
    });

    clientToken = generateJWT({
      userId: clientUser._id.toString(),
      email: clientUser.email,
      role: clientUser.role,
    });
  });

  describe('POST /api/migrations', () => {
    it('should create migration with template (InterWorks only)', async () => {
      const migrationData = {
        clientEmail: 'client@company.com',
        clientInfo: {
          clientName: 'Acme Corp',
          region: 'US-West',
        },
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(migrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.clientEmail).toBe('client@company.com');
      expect(response.body.migration.questions).toHaveLength(55);
      expect(response.body.migration.createdBy).toBe('consultant@interworks.com');
    });

    it('should fail if client user does not exist', async () => {
      const migrationData = {
        clientEmail: 'nonexistent@company.com',
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(migrationData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail if migration already exists for client', async () => {
      // Create first migration
      await Migration.create({
        clientEmail: 'client@company.com',
        questions: [],
        createdBy: 'consultant@interworks.com',
      });

      const migrationData = {
        clientEmail: 'client@company.com',
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(migrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail for client users', async () => {
      const migrationData = {
        clientEmail: 'client@company.com',
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(migrationData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const migrationData = {
        clientEmail: 'client@company.com',
      };

      await request(app).post('/api/migrations').send(migrationData).expect(401);
    });
  });

  describe('GET /api/migrations', () => {
    beforeEach(async () => {
      // Create some migrations
      await Migration.create({
        clientEmail: 'client@company.com',
        clientInfo: { clientName: 'Company A' },
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question 1',
            questionType: 'checkbox',
            completed: true,
            order: 1,
            metadata: {},
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question 2',
            questionType: 'checkbox',
            completed: false,
            order: 2,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });

      // Create another client and migration
      const otherClient = await User.create({
        email: 'other@company.com',
        passwordHash: 'Password123!',
        role: 'client',
      });

      await Migration.create({
        clientEmail: 'other@company.com',
        clientInfo: { clientName: 'Company B' },
        questions: [],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should list all migrations for InterWorks users', async () => {
      const response = await request(app)
        .get('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.migrations[0].progress).toBeDefined();
    });

    it('should list only own migration for client users', async () => {
      const response = await request(app)
        .get('/api/migrations')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(1);
      expect(response.body.migrations[0].clientEmail).toBe('client@company.com');
    });

    it('should filter by client email (InterWorks only)', async () => {
      const response = await request(app)
        .get('/api/migrations?clientEmail=client@company.com')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(1);
      expect(response.body.migrations[0].clientEmail).toBe('client@company.com');
    });
  });

  describe('GET /api/migrations/:id', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        clientInfo: { clientName: 'Acme Corp' },
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question',
            questionType: 'checkbox',
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should get migration by ID for InterWorks', async () => {
      const response = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration._id).toBe(migration._id.toString());
      expect(response.body.migration.questions).toHaveLength(1);
      expect(response.body.migration.progress).toBeDefined();
    });

    it('should get own migration for client', async () => {
      const response = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration._id).toBe(migration._id.toString());
    });

    it('should deny access to other client migrations', async () => {
      const otherClient = await User.create({
        email: 'other@company.com',
        passwordHash: 'Password123!',
        role: 'client',
      });

      const otherToken = generateJWT({
        userId: otherClient._id.toString(),
        email: otherClient.email,
        role: otherClient.role,
      });

      const response = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent migration', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/migrations/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/migrations/:id', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        clientInfo: { clientName: 'Acme Corp' },
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question',
            questionType: 'checkbox',
            answer: null,
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        additionalNotes: '',
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should update migration client info', async () => {
      const updates = {
        clientInfo: {
          clientName: 'Updated Corp',
          region: 'US-East',
        },
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.clientInfo.clientName).toBe('Updated Corp');
      expect(response.body.migration.clientInfo.region).toBe('US-East');
    });

    it('should update questions', async () => {
      const updates = {
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Test question',
            questionType: 'checkbox',
            answer: true,
            completed: true,
            timestamp: new Date(),
            order: 1,
            metadata: {},
          },
        ],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions[0].completed).toBe(true);
    });

    it('should update additional notes', async () => {
      const updates = {
        additionalNotes: 'Some important notes',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.additionalNotes).toBe('Some important notes');
    });

    it('should deny client access to other migrations', async () => {
      const otherClient = await User.create({
        email: 'other@company.com',
        passwordHash: 'Password123!',
        role: 'client',
      });

      const otherToken = generateJWT({
        userId: otherClient._id.toString(),
        email: otherClient.email,
        role: otherClient.role,
      });

      const updates = {
        additionalNotes: 'Hacking attempt',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/migrations/:id', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        questions: [],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should delete migration (InterWorks only)', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await Migration.findById(migration._id);
      expect(deleted).toBeNull();
    });

    it('should fail for client users', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent migration', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/migrations/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/migrations/:id/questions', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Existing question',
            questionType: 'checkbox',
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should add question to migration (InterWorks only)', async () => {
      const newQuestion = {
        section: 'Security',
        questionText: 'New custom question?',
        questionType: 'yesNo',
        options: ['Yes', 'No'],
        metadata: {
          infoTooltip: 'Important question',
        },
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions).toHaveLength(2);
      expect(response.body.migration.questions[1].questionText).toBe('New custom question?');
      expect(response.body.migration.questions[1].order).toBe(2);
    });

    it('should fail for client users', async () => {
      const newQuestion = {
        section: 'Security',
        questionText: 'Unauthorized question',
        questionType: 'checkbox',
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newQuestion)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidQuestion = {
        section: 'Security',
        // Missing questionText
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(invalidQuestion)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/migrations/:id/questions/:questionId', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Original question',
            questionType: 'checkbox',
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should update question (InterWorks only)', async () => {
      const updates = {
        questionText: 'Updated question text',
        questionType: 'yesNo',
        options: ['Yes', 'No'],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions[0].questionText).toBe('Updated question text');
      expect(response.body.migration.questions[0].questionType).toBe('yesNo');
    });

    it('should fail for client users', async () => {
      const updates = {
        questionText: 'Unauthorized update',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent question', async () => {
      const updates = {
        questionText: 'Updated text',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/q999`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/migrations/:id/questions/:questionId', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question 1',
            questionType: 'checkbox',
            order: 1,
            metadata: {},
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question 2',
            questionType: 'checkbox',
            order: 2,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should delete question and reorder (InterWorks only)', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions).toHaveLength(1);
      expect(response.body.migration.questions[0].id).toBe('q2');
      expect(response.body.migration.questions[0].order).toBe(1);
    });

    it('should fail for client users', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/migrations/:id/questions/reorder', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientEmail: 'client@company.com',
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question 1',
            questionType: 'checkbox',
            order: 1,
            metadata: {},
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question 2',
            questionType: 'checkbox',
            order: 2,
            metadata: {},
          },
          {
            id: 'q3',
            section: 'Security',
            questionText: 'Question 3',
            questionType: 'checkbox',
            order: 3,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should reorder questions (InterWorks only)', async () => {
      const newOrder = {
        questionIds: ['q3', 'q1', 'q2'],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/reorder`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newOrder)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions[0].id).toBe('q3');
      expect(response.body.migration.questions[0].order).toBe(1);
      expect(response.body.migration.questions[1].id).toBe('q1');
      expect(response.body.migration.questions[1].order).toBe(2);
      expect(response.body.migration.questions[2].id).toBe('q2');
      expect(response.body.migration.questions[2].order).toBe(3);
    });

    it('should fail for invalid question IDs', async () => {
      const newOrder = {
        questionIds: ['q1', 'q999'],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/reorder`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid question IDs');
    });

    it('should fail for client users', async () => {
      const newOrder = {
        questionIds: ['q2', 'q1', 'q3'],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/reorder`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newOrder)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
