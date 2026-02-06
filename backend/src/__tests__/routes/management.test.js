/**
 * Management Module API Routes Tests
 *
 * Tests for management module enable, notes CRUD operations, and access control.
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Migration = require('../../models/Migration');
const Client = require('../../models/Client');
const User = require('../../models/User');
const migrationRoutes = require('../../routes/migrations');
const { requireAuth, requireInterWorks } = require('../../middleware/auth');

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = req.headers['x-test-user']
      ? JSON.parse(req.headers['x-test-user'])
      : { email: 'test@interworks.com', role: 'interworks' };
    next();
  },
  requireInterWorks: (req, res, next) => {
    if (req.user.role !== 'interworks') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/migrations', migrationRoutes);

describe('Management Module Routes', () => {
  let testClient;
  let testMigration;
  let interworksUser;

  beforeAll(async () => {
    // Create test client
    testClient = await Client.create({
      name: 'Test Client',
      email: 'client@test.com',
    });

    // Create interworks user
    interworksUser = {
      email: 'test@interworks.com',
      role: 'interworks',
    };
  });

  beforeEach(async () => {
    // Create test migration
    testMigration = await Migration.create({
      clientId: testClient._id,
      clientInfo: {
        clientName: 'Test Migration',
        region: 'US-West',
      },
      questions: [],
      createdBy: interworksUser.email,
    });
  });

  afterEach(async () => {
    await Migration.deleteMany({});
  });

  afterAll(async () => {
    await Client.deleteMany({});
  });

  describe('POST /:id/management/enable', () => {
    it('should enable management module for migration', async () => {
      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/enable`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.migration.managementModule.enabled).toBe(true);
      expect(response.body.migration.managementModule.createdBy).toBe(interworksUser.email);
    });

    it('should not enable management module if already enabled', async () => {
      // Enable first time
      await request(app)
        .post(`/api/migrations/${testMigration._id}/management/enable`)
        .set('x-test-user', JSON.stringify(interworksUser));

      // Try to enable again
      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/enable`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already enabled');
    });

    it('should require InterWorks role', async () => {
      const clientUser = {
        email: 'client@test.com',
        role: 'client',
        clientId: testClient._id,
      };

      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/enable`)
        .set('x-test-user', JSON.stringify(clientUser))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /:id/management', () => {
    beforeEach(async () => {
      // Enable management module
      testMigration.managementModule = {
        enabled: true,
        createdAt: new Date(),
        createdBy: interworksUser.email,
        weeklyNotes: [
          {
            date: new Date(),
            content: 'Test note',
            createdBy: interworksUser.email,
          },
        ],
      };
      await testMigration.save();
    });

    it('should get management data for InterWorks user', async () => {
      const response = await request(app)
        .get(`/api/migrations/${testMigration._id}/management`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.management).toBeDefined();
      expect(response.body.management.weeklyNotes).toHaveLength(1);
    });

    it('should return 404 if management not enabled', async () => {
      // Create migration without management
      const newMigration = await Migration.create({
        clientId: testClient._id,
        clientInfo: { clientName: 'Test' },
        questions: [],
        createdBy: interworksUser.email,
      });

      const response = await request(app)
        .get(`/api/migrations/${newMigration._id}/management`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(404);

      expect(response.body.message).toContain('not enabled');
    });
  });

  describe('POST /:id/management/notes', () => {
    beforeEach(async () => {
      // Enable management module
      testMigration.managementModule = {
        enabled: true,
        createdAt: new Date(),
        createdBy: interworksUser.email,
        weeklyNotes: [],
      };
      await testMigration.save();
    });

    it('should add weekly note', async () => {
      const noteData = {
        content: 'Weekly update note',
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/notes`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.note.content).toBe(noteData.content);
      expect(response.body.note.createdBy).toBe(interworksUser.email);
    });

    it('should require content', async () => {
      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/notes`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .send({ content: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require InterWorks role', async () => {
      const clientUser = {
        email: 'client@test.com',
        role: 'client',
        clientId: testClient._id,
      };

      const response = await request(app)
        .post(`/api/migrations/${testMigration._id}/management/notes`)
        .set('x-test-user', JSON.stringify(clientUser))
        .send({ content: 'Test note' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /:id/management/notes/:noteId', () => {
    let noteId;

    beforeEach(async () => {
      // Enable management module with a note
      testMigration.managementModule = {
        enabled: true,
        createdAt: new Date(),
        createdBy: interworksUser.email,
        weeklyNotes: [
          {
            date: new Date(),
            content: 'Original note',
            createdBy: interworksUser.email,
          },
        ],
      };
      await testMigration.save();
      noteId = testMigration.managementModule.weeklyNotes[0]._id;
    });

    it('should edit weekly note', async () => {
      const updates = {
        content: 'Updated note content',
      };

      const response = await request(app)
        .put(`/api/migrations/${testMigration._id}/management/notes/${noteId}`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.note.content).toBe(updates.content);
      expect(response.body.note.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent note', async () => {
      const fakeNoteId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/migrations/${testMigration._id}/management/notes/${fakeNoteId}`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .send({ content: 'Updated' })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /:id/management/notes/:noteId', () => {
    let noteId;

    beforeEach(async () => {
      // Enable management module with a note
      testMigration.managementModule = {
        enabled: true,
        createdAt: new Date(),
        createdBy: interworksUser.email,
        weeklyNotes: [
          {
            date: new Date(),
            content: 'Note to delete',
            createdBy: interworksUser.email,
          },
        ],
      };
      await testMigration.save();
      noteId = testMigration.managementModule.weeklyNotes[0]._id;
    });

    it('should delete weekly note', async () => {
      const response = await request(app)
        .delete(`/api/migrations/${testMigration._id}/management/notes/${noteId}`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify note was deleted
      const migration = await Migration.findById(testMigration._id);
      expect(migration.managementModule.weeklyNotes).toHaveLength(0);
    });

    it('should return 404 for non-existent note', async () => {
      const fakeNoteId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/migrations/${testMigration._id}/management/notes/${fakeNoteId}`)
        .set('x-test-user', JSON.stringify(interworksUser))
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });
});
