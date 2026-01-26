/**
 * User Management Routes Tests
 *
 * Integration tests for user management endpoints.
 */

const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/users');
const User = require('../../models/User');
const Migration = require('../../models/Migration');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Management Routes', () => {
  let interworksUser, interworksToken;
  let clientUser, clientToken;

  beforeEach(async () => {
    // Create InterWorks user
    interworksUser = await User.create({
      email: 'admin@interworks.com',
      passwordHash: 'Password123!',
      name: 'Admin User',
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

  describe('POST /api/users', () => {
    it('should create client user with provided password (InterWorks only)', async () => {
      const userData = {
        email: 'newclient@company.com',
        password: 'ClientPass123!',
        name: 'New Client',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newclient@company.com');
      expect(response.body.user.role).toBe('client');
      expect(response.body.user.name).toBe('New Client');
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.generatedPassword).toBeUndefined();
    });

    it('should create client user with generated password', async () => {
      const userData = {
        email: 'autoclient@company.com',
        name: 'Auto Client',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('autoclient@company.com');
      expect(response.body.user.role).toBe('client');
      expect(response.body.generatedPassword).toBeDefined();
      expect(response.body.generatedPassword.length).toBeGreaterThan(8);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'client@company.com', // Already exists
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email', async () => {
      const userData = {
        email: 'not-an-email',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const userData = {
        email: 'test@company.com',
        password: 'short',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for client users', async () => {
      const userData = {
        email: 'hacker@company.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const userData = {
        email: 'test@company.com',
        password: 'Password123!',
      };

      await request(app).post('/api/users').send(userData).expect(401);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional users
      await User.create({
        email: 'user1@company.com',
        passwordHash: 'Password123!',
        role: 'client',
      });

      await User.create({
        email: 'user2@company.com',
        passwordHash: 'Password123!',
        role: 'client',
      });

      await User.create({
        email: 'consultant2@interworks.com',
        passwordHash: 'Password123!',
        role: 'interworks',
      });
    });

    it('should list all users (InterWorks only)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(5); // 2 interworks + 3 clients
      expect(response.body.count).toBe(5);
      expect(response.body.users[0].migrationCount).toBeDefined();
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/users?role=client')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(3);
      expect(response.body.users.every((u) => u.role === 'client')).toBe(true);
    });

    it('should include migration count', async () => {
      // Create migration for client
      await Migration.create({
        clientEmail: 'client@company.com',
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      const clientWithMigration = response.body.users.find(
        (u) => u.email === 'client@company.com'
      );
      expect(clientWithMigration.migrationCount).toBe(1);
    });

    it('should fail for client users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID with migrations (InterWorks only)', async () => {
      // Create migration for client
      await Migration.create({
        clientEmail: 'client@company.com',
        clientInfo: { clientName: 'Test Company' },
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .get(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('client@company.com');
      expect(response.body.migrations).toHaveLength(1);
      expect(response.body.migrations[0].clientInfo.clientName).toBe('Test Company');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail for client users', async () => {
      const response = await request(app)
        .get(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user name (InterWorks only)', async () => {
      const updates = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
    });

    it('should update user password', async () => {
      const updates = {
        password: 'NewPassword123!',
      };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify password was hashed
      const updatedUser = await User.findById(clientUser._id);
      expect(updatedUser.passwordHash).not.toBe('NewPassword123!');
    });

    it('should fail with short password', async () => {
      const updates = {
        password: 'short',
      };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updates = { name: 'Test' };

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail for client users', async () => {
      const updates = { name: 'Hacker' };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user without migrations (InterWorks only)', async () => {
      const response = await request(app)
        .delete(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(clientUser._id);
      expect(deleted).toBeNull();
    });

    it('should fail to delete user with migrations', async () => {
      // Create migration for client
      await Migration.create({
        clientEmail: 'client@company.com',
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .delete(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('active migration');
    });

    it('should fail to delete InterWorks users', async () => {
      const response = await request(app)
        .delete(`/api/users/${interworksUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete InterWorks users');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail for client users', async () => {
      const response = await request(app)
        .delete(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
