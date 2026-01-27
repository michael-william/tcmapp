/**
 * User Management Routes Tests
 *
 * Integration tests for user management endpoints.
 */

const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/users');
const User = require('../../models/User');
const Client = require('../../models/Client');
const Migration = require('../../models/Migration');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Management Routes', () => {
  let interworksUser, interworksToken;
  let guestUser, guestToken;
  let client;

  beforeEach(async () => {
    // Create Client
    client = await Client.create({
      name: 'Test Client Company',
      email: 'contact@testclient.com',
    });

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

    // Create guest user
    guestUser = await User.create({
      email: 'guest@company.com',
      passwordHash: 'Password123!',
      name: 'Guest User',
      role: 'guest',
      clientId: client._id,
    });

    guestToken = generateJWT({
      userId: guestUser._id.toString(),
      email: guestUser.email,
      role: guestUser.role,
      clientId: guestUser.clientId.toString(),
    });
  });

  describe('POST /api/users', () => {
    it('should create guest user with provided password (InterWorks only)', async () => {
      const userData = {
        email: 'newguest@company.com',
        password: 'GuestPass123!',
        name: 'New Guest',
        clientId: client._id.toString(),
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newguest@company.com');
      expect(response.body.user.role).toBe('guest');
      expect(response.body.user.name).toBe('New Guest');
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.generatedPassword).toBeUndefined();
    });

    it('should create guest user with generated password', async () => {
      const userData = {
        email: 'autoguest@company.com',
        name: 'Auto Guest',
        clientId: client._id.toString(),
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('autoguest@company.com');
      expect(response.body.user.role).toBe('guest');
      expect(response.body.generatedPassword).toBeDefined();
      expect(response.body.generatedPassword.length).toBeGreaterThan(8);
    });

    it('should fail without clientId', async () => {
      const userData = {
        email: 'noclient@company.com',
        password: 'Password123!',
        // Missing clientId
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent clientId', async () => {
      const userData = {
        email: 'badclient@company.com',
        password: 'Password123!',
        clientId: '507f1f77bcf86cd799439011', // Non-existent
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'guest@company.com', // Already exists
        password: 'Password123!',
        clientId: client._id.toString(),
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
        clientId: client._id.toString(),
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
        clientId: client._id.toString(),
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for guest users', async () => {
      const userData = {
        email: 'hacker@company.com',
        password: 'Password123!',
        clientId: client._id.toString(),
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const userData = {
        email: 'test@company.com',
        password: 'Password123!',
        clientId: client._id.toString(),
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
        role: 'guest',
        clientId: client._id,
      });

      await User.create({
        email: 'user2@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientId: client._id,
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
      expect(response.body.users).toHaveLength(5); // 2 interworks + 3 guests
      expect(response.body.count).toBe(5);
      expect(response.body.users[0].migrationCount).toBeDefined();
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/users?role=guest')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(3);
      expect(response.body.users.every((u) => u.role === 'guest')).toBe(true);
    });

    it('should filter by clientId', async () => {
      const otherClient = await Client.create({
        name: 'Other Client',
        email: 'other@client.com',
      });

      await User.create({
        email: 'othergues@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientId: otherClient._id,
      });

      const response = await request(app)
        .get(`/api/users?clientId=${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(3); // Only guests for main client
      expect(response.body.users.every((u) => u.clientId._id === client._id.toString())).toBe(true);
    });

    it('should include migration count for guest client', async () => {
      // Create migrations for client
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      const guestWithMigrations = response.body.users.find(
        (u) => u.email === 'guest@company.com'
      );
      expect(guestWithMigrations.migrationCount).toBe(2);
    });

    it('should fail for guest users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID with migrations (InterWorks only)', async () => {
      // Create migrations for guest's client
      await Migration.create({
        clientId: client._id,
        clientInfo: { clientName: 'Test Company' },
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .get(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('guest@company.com');
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

    it('should fail for guest users', async () => {
      const response = await request(app)
        .get(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
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
        .put(`/api/users/${guestUser._id}`)
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
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify password was hashed
      const updatedUser = await User.findById(guestUser._id);
      expect(updatedUser.passwordHash).not.toBe('NewPassword123!');
    });

    it('should fail with short password', async () => {
      const updates = {
        password: 'short',
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
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

    it('should fail for guest users', async () => {
      const updates = { name: 'Hacker' };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete guest user (InterWorks only)', async () => {
      const response = await request(app)
        .delete(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(guestUser._id);
      expect(deleted).toBeNull();
    });

    it('should delete guest even with client migrations', async () => {
      // Create migrations for guest's client
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      // Should still succeed (guests can be deleted freely)
      const response = await request(app)
        .delete(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(guestUser._id);
      expect(deleted).toBeNull();
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

    it('should fail for guest users', async () => {
      const response = await request(app)
        .delete(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
