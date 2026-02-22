/**
 * Migration Routes Tests
 *
 * Integration tests for migration CRUD and question management endpoints.
 */

const request = require('supertest');
const express = require('express');
const migrationRoutes = require('../../routes/migrations');
const User = require('../../models/User');
const Client = require('../../models/Client');
const Migration = require('../../models/Migration');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/migrations', migrationRoutes);

describe('Migration Routes', () => {
  let interworksUser, interworksToken;
  let guestUser, guestToken;
  let client;
  let migration;

  beforeEach(async () => {
    // Create Client
    client = await Client.create({
      name: 'Acme Corp',
      email: 'contact@acme.com',
    });

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

    // Create guest user
    guestUser = await User.create({
      email: 'guest@company.com',
      passwordHash: 'Password123!',
      name: 'Guest User',
      role: 'guest',
      clientIds: [client._id],
    });

    guestToken = generateJWT({
      userId: guestUser._id.toString(),
      email: guestUser.email,
      role: guestUser.role,
      clientIds: [guestUser.clientIds[0].toString()],
    });
  });

  describe('POST /api/migrations', () => {
    it('should create migration with template (InterWorks only)', async () => {
      const migrationData = {
        clientId: client._id.toString(),
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
      expect(response.body.migration.clientId).toBe(client._id.toString());
      expect(response.body.migration.questions).toHaveLength(64);
      expect(response.body.migration.createdBy).toBe('consultant@interworks.com');
    });

    it('should allow multiple migrations for same client', async () => {
      // Create first migration
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'consultant@interworks.com',
      });

      // Create second migration - should succeed
      const migrationData = {
        clientId: client._id.toString(),
        clientInfo: {
          clientName: 'Acme Corp',
        },
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(migrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.clientId).toBe(client._id.toString());
    });

    it('should fail if client does not exist', async () => {
      const migrationData = {
        clientId: '507f1f77bcf86cd799439011', // Non-existent ID
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(migrationData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail for guest users', async () => {
      const migrationData = {
        clientId: client._id.toString(),
      };

      const response = await request(app)
        .post('/api/migrations')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(migrationData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const migrationData = {
        clientId: client._id.toString(),
      };

      await request(app).post('/api/migrations').send(migrationData).expect(401);
    });
  });

  describe('GET /api/migrations', () => {
    beforeEach(async () => {
      // Create some migrations for the main client
      await Migration.create({
        clientId: client._id,
        clientInfo: { clientName: 'Acme Corp' },
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
      const otherClient = await Client.create({
        name: 'Other Corp',
        email: 'other@company.com',
      });

      await Migration.create({
        clientId: otherClient._id,
        clientInfo: { clientName: 'Other Corp' },
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

    it('should list only own client migrations for guest users', async () => {
      const response = await request(app)
        .get('/api/migrations')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(1);
      expect(response.body.migrations[0].clientId._id.toString()).toBe(client._id.toString());
    });

    it('should filter by client ID (InterWorks only)', async () => {
      const response = await request(app)
        .get(`/api/migrations?clientId=${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(1);
      expect(response.body.migrations[0].clientId._id.toString()).toBe(client._id.toString());
    });

    it('should list migrations from all assigned clients for guest users', async () => {
      // Create second client
      const secondClient = await Client.create({
        name: 'Second Corp',
        email: 'second@company.com',
      });

      // Create migration for second client
      await Migration.create({
        clientId: secondClient._id,
        clientInfo: { clientName: 'Second Corp' },
        questions: [],
        createdBy: 'consultant@interworks.com',
      });

      // Create guest user with access to both clients
      const multiClientGuest = await User.create({
        email: 'multiguest@company.com',
        passwordHash: 'Password123!',
        name: 'Multi Client Guest',
        role: 'guest',
        clientIds: [client._id, secondClient._id],
      });

      const multiGuestToken = generateJWT({
        userId: multiClientGuest._id.toString(),
        email: multiClientGuest.email,
        role: multiClientGuest.role,
        clientIds: [client._id.toString(), secondClient._id.toString()],
      });

      const response = await request(app)
        .get('/api/migrations')
        .set('Authorization', `Bearer ${multiGuestToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migrations).toHaveLength(2);

      // Verify both clients' migrations are included
      const clientIds = response.body.migrations.map(m => m.clientId._id.toString());
      expect(clientIds).toContain(client._id.toString());
      expect(clientIds).toContain(secondClient._id.toString());
    });
  });

  describe('GET /api/migrations/:id', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientId: client._id,
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

    it('should get own client migration for guest', async () => {
      const response = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration._id).toBe(migration._id.toString());
    });

    it('should allow guest to access migration from any assigned client', async () => {
      // Create second client
      const secondClient = await Client.create({
        name: 'Second Client',
        email: 'second@company.com',
      });

      // Create migration for second client
      const secondMigration = await Migration.create({
        clientId: secondClient._id,
        clientInfo: { clientName: 'Second Client' },
        questions: [],
        createdBy: 'consultant@interworks.com',
      });

      // Create guest user with access to both clients
      const multiClientGuest = await User.create({
        email: 'multiguest@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [client._id, secondClient._id],
      });

      const multiGuestToken = generateJWT({
        userId: multiClientGuest._id.toString(),
        email: multiClientGuest.email,
        role: multiClientGuest.role,
        clientIds: [client._id.toString(), secondClient._id.toString()],
      });

      // Should be able to access first client's migration
      const response1 = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${multiGuestToken}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.migration._id).toBe(migration._id.toString());

      // Should be able to access second client's migration
      const response2 = await request(app)
        .get(`/api/migrations/${secondMigration._id}`)
        .set('Authorization', `Bearer ${multiGuestToken}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.migration._id).toBe(secondMigration._id.toString());
    });

    it('should deny access to other client migrations', async () => {
      const otherClient = await Client.create({
        name: 'Other Client',
        email: 'other2@company.com',
      });

      const otherGuest = await User.create({
        email: 'guest2@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [otherClient._id],
      });

      const otherToken = generateJWT({
        userId: otherGuest._id.toString(),
        email: otherGuest.email,
        role: otherGuest.role,
        clientIds: [otherGuest.clientIds[0].toString()],
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
        clientId: client._id,
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
        .set('Authorization', `Bearer ${guestToken}`)
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
        .set('Authorization', `Bearer ${guestToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.additionalNotes).toBe('Some important notes');
    });

    it('should deny guest access to other client migrations', async () => {
      const otherClient = await Client.create({
        name: 'Other Client',
        email: 'other3@company.com',
      });

      const otherGuest = await User.create({
        email: 'guest3@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [otherClient._id],
      });

      const otherToken = generateJWT({
        userId: otherGuest._id.toString(),
        email: otherGuest.email,
        role: otherGuest.role,
        clientIds: [otherGuest.clientIds[0].toString()],
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
        clientId: client._id,
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

    it('should fail for guest users', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
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
        clientId: client._id,
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

    it('should fail for guest users', async () => {
      const newQuestion = {
        section: 'Security',
        questionText: 'Unauthorized question',
        questionType: 'checkbox',
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${guestToken}`)
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

    it('should generate semantic questionKey following naming convention', async () => {
      const newQuestion = {
        section: 'Testing',
        questionText: 'Does the add question button work?',
        questionType: 'yesNo',
        options: ['Yes', 'No'],
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      expect(response.body.success).toBe(true);
      const addedQuestion = response.body.migration.questions[1];
      expect(addedQuestion.questionKey).toBeDefined();
      expect(addedQuestion.questionKey).toMatch(/^testing_/);
      expect(addedQuestion.questionKey).toContain('add');
      expect(addedQuestion.questionKey).toContain('question');
    });

    it('should ensure questionKey uniqueness by appending counter', async () => {
      // Add first question
      const question1 = {
        section: 'Security',
        questionText: 'Is MFA enabled?',
        questionType: 'yesNo',
        options: ['Yes', 'No'],
      };

      const response1 = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(question1)
        .expect(201);

      const firstKey = response1.body.migration.questions[1].questionKey;

      // Add duplicate question text
      const question2 = {
        section: 'Security',
        questionText: 'Is MFA enabled?',
        questionType: 'checkbox',
      };

      const response2 = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(question2)
        .expect(201);

      const secondKey = response2.body.migration.questions[2].questionKey;

      // Should have different keys
      expect(firstKey).toBeDefined();
      expect(secondKey).toBeDefined();
      expect(secondKey).not.toBe(firstKey);
      expect(secondKey).toMatch(/_\d+$/); // Should end with _1 or similar
    });

    it('should generate unique question IDs preventing duplicates', async () => {
      // Create migration with questions that have gaps in numbering
      // This simulates a scenario where questions were added/deleted previously
      const fullMigration = await Migration.create({
        clientId: client._id,
        questions: [
          { id: 'q1', questionKey: 'security_q1', section: 'Security', questionText: 'Q1', questionType: 'checkbox', order: 1 },
          { id: 'q2', questionKey: 'security_q2', section: 'Security', questionText: 'Q2', questionType: 'checkbox', order: 2 },
          { id: 'q5', questionKey: 'security_q5', section: 'Security', questionText: 'Q5', questionType: 'checkbox', order: 5 },
          { id: 'q10', questionKey: 'security_q10', section: 'Security', questionText: 'Q10', questionType: 'checkbox', order: 10 },
        ],
        createdBy: 'consultant@interworks.com',
      });

      // Add new question - should use max+1 (q11), not length+1 (q5 which would be duplicate)
      const newQuestion = {
        section: 'Security',
        questionText: 'New question after gaps',
        questionType: 'checkbox',
      };

      const response = await request(app)
        .post(`/api/migrations/${fullMigration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      const questions = response.body.migration.questions;
      const addedQuestion = questions.find(q => q.questionText === 'New question after gaps');

      expect(addedQuestion).toBeDefined();
      expect(addedQuestion.id).toBe('q11'); // max(1,2,5,10) + 1 = 11

      // Verify no duplicate IDs exist
      const ids = questions.map(q => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length); // All IDs should be unique
    });

    it('should include progress in response', async () => {
      const newQuestion = {
        section: 'Security',
        questionText: 'Test progress in response',
        questionType: 'checkbox',
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      expect(response.body.migration.progress).toBeDefined();
      expect(response.body.migration.progress.total).toBeDefined();
      expect(response.body.migration.progress.completed).toBeDefined();
      expect(response.body.migration.progress.percentage).toBeDefined();
    });

    it('should map helpText to metadata.infoTooltip', async () => {
      const newQuestion = {
        section: 'Communications',
        questionText: 'Question with help text',
        questionType: 'textInput',
        helpText: 'This is helpful information',
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      const addedQuestion = response.body.migration.questions[1];
      expect(addedQuestion.helpText).toBe('This is helpful information');
      expect(addedQuestion.metadata.infoTooltip).toBe('This is helpful information');
    });
  });

  describe('PUT /api/migrations/:id/questions/:questionId', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientId: client._id,
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

    it('should fail for guest users', async () => {
      const updates = {
        questionText: 'Unauthorized update',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${guestToken}`)
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
        clientId: client._id,
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

    it('should fail for guest users', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${migration._id}/questions/q1`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/migrations/:id/questions/reorder', () => {
    beforeEach(async () => {
      migration = await Migration.create({
        clientId: client._id,
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

    it('should fail for guest users', async () => {
      const newOrder = {
        questionIds: ['q2', 'q1', 'q3'],
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/reorder`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send(newOrder)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Question helpText transformation', () => {
    beforeEach(async () => {
      // Create a migration with a question that has infoTooltip
      migration = await Migration.create({
        clientId: client._id,
        clientInfo: { clientName: 'Acme Corp' },
        questions: [
          {
            id: 'q1',
            section: 'Security',
            questionText: 'Question with tooltip',
            questionType: 'checkbox',
            completed: false,
            order: 1,
            metadata: {
              infoTooltip: 'This is a helpful tooltip',
            },
          },
          {
            id: 'q2',
            section: 'Security',
            questionText: 'Question without tooltip',
            questionType: 'checkbox',
            completed: false,
            order: 2,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });
    });

    it('should transform metadata.infoTooltip to helpText on GET /api/migrations/:id', async () => {
      const response = await request(app)
        .get(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions[0].helpText).toBe('This is a helpful tooltip');
      expect(response.body.migration.questions[0].metadata.infoTooltip).toBe('This is a helpful tooltip');
      expect(response.body.migration.questions[1].helpText).toBeUndefined();
    });

    it('should transform metadata.infoTooltip to helpText on GET /api/migrations', async () => {
      const response = await request(app)
        .get('/api/migrations')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const migrationData = response.body.migrations.find((m) => m._id === migration._id.toString());
      expect(migrationData.questions[0].helpText).toBe('This is a helpful tooltip');
      expect(migrationData.questions[1].helpText).toBeUndefined();
    });

    it('should transform helpText to metadata.infoTooltip on PUT /api/migrations/:id', async () => {
      const updatedQuestions = [
        {
          id: 'q1',
          section: 'Security',
          questionText: 'Updated question',
          questionType: 'checkbox',
          completed: false,
          order: 1,
          helpText: 'Updated tooltip text',
        },
      ];

      const response = await request(app)
        .put(`/api/migrations/${migration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send({ questions: updatedQuestions })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check database directly
      const updatedMigration = await Migration.findById(migration._id);
      expect(updatedMigration.questions[0].metadata.infoTooltip).toBe('Updated tooltip text');
      expect(updatedMigration.questions[0].helpText).toBeUndefined();

      // Check response has helpText
      expect(response.body.migration.questions[0].helpText).toBe('Updated tooltip text');
    });

    it('should accept helpText when creating new questions', async () => {
      const newQuestion = {
        section: 'Communications',
        questionText: 'New question with help',
        questionType: 'checkbox',
        helpText: 'Helpful information',
      };

      const response = await request(app)
        .post(`/api/migrations/${migration._id}/questions`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(newQuestion)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Check database directly
      const updatedMigration = await Migration.findById(migration._id);
      const createdQuestion = updatedMigration.questions[updatedMigration.questions.length - 1];
      expect(createdQuestion.metadata.infoTooltip).toBe('Helpful information');
      expect(createdQuestion.helpText).toBeUndefined();

      // Check response has helpText
      const responseQuestion = response.body.migration.questions[response.body.migration.questions.length - 1];
      expect(responseQuestion.helpText).toBe('Helpful information');
    });

    it('should accept helpText when updating questions', async () => {
      const updates = {
        questionText: 'Updated text',
        helpText: 'New tooltip',
      };

      const response = await request(app)
        .put(`/api/migrations/${migration._id}/questions/q2`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check database directly
      const updatedMigration = await Migration.findById(migration._id);
      const updatedQuestion = updatedMigration.questions.find((q) => q.id === 'q2');
      expect(updatedQuestion.metadata.infoTooltip).toBe('New tooltip');
      expect(updatedQuestion.helpText).toBeUndefined();

      // Check response has helpText
      const responseQuestion = response.body.migration.questions.find((q) => q.id === 'q2');
      expect(responseQuestion.helpText).toBe('New tooltip');
    });

    it('should maintain backward compatibility with questions without tooltips', async () => {
      // Create migration with no tooltips
      const simpleMigration = await Migration.create({
        clientId: client._id,
        questions: [
          {
            id: 'q1',
            section: 'Test',
            questionText: 'Simple question',
            questionType: 'checkbox',
            completed: false,
            order: 1,
            metadata: {},
          },
        ],
        createdBy: 'consultant@interworks.com',
      });

      const response = await request(app)
        .get(`/api/migrations/${simpleMigration._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.questions[0].helpText).toBeUndefined();
      expect(response.body.migration.questions[0].metadata.infoTooltip).toBeUndefined();
    });
  });
});
