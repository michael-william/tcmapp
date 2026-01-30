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
      clientIds: [client._id],
    });

    guestToken = generateJWT({
      userId: guestUser._id.toString(),
      email: guestUser.email,
      role: guestUser.role,
      clientIds: [guestUser.clientIds[0].toString()],
    });
  });

  describe('POST /api/users', () => {
    it('should create guest user with provided password (InterWorks only)', async () => {
      const userData = {
        email: 'newguest@company.com',
        password: 'GuestPass123!',
        name: 'New Guest',
        clientIds: [client._id.toString()],
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
        clientIds: [client._id.toString()],
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

    it('should fail without clientIds for guest users', async () => {
      const userData = {
        email: 'noclient@company.com',
        password: 'Password123!',
        role: 'guest',
        // Missing clientIds
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent clientIds', async () => {
      const userData = {
        email: 'badclient@company.com',
        password: 'Password123!',
        clientIds: ['507f1f77bcf86cd799439011'], // Non-existent
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
        clientIds: [client._id.toString()],
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
        clientIds: [client._id.toString()],
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
        clientIds: [client._id.toString()],
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
        clientIds: [client._id.toString()],
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
        clientIds: [client._id.toString()],
      };

      await request(app).post('/api/users').send(userData).expect(401);
    });

    it('should create InterWorks user without clientIds', async () => {
      const userData = {
        email: 'newconsultant@interworks.com',
        password: 'ConsultantPass123!',
        name: 'New Consultant',
        role: 'interworks',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newconsultant@interworks.com');
      expect(response.body.user.role).toBe('interworks');
      expect(response.body.user.clientIds).toEqual([]);
    });

    it('should create InterWorks user with optional clientIds', async () => {
      const userData = {
        email: 'teamlead@interworks.com',
        password: 'TeamPass123!',
        name: 'Team Lead',
        role: 'interworks',
        clientIds: [client._id.toString()],
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('teamlead@interworks.com');
      expect(response.body.user.role).toBe('interworks');
      expect(response.body.user.clientIds).toHaveLength(1);
    });

    it('should create multiple InterWorks users for same client', async () => {
      const user1Data = {
        email: 'consultant1@interworks.com',
        password: 'Pass123!',
        name: 'Consultant 1',
        role: 'interworks',
        clientIds: [client._id.toString()],
      };

      const user2Data = {
        email: 'consultant2@interworks.com',
        password: 'Pass123!',
        name: 'Consultant 2',
        role: 'interworks',
        clientIds: [client._id.toString()],
      };

      const response1 = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(user1Data)
        .expect(201);

      const response2 = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(user2Data)
        .expect(201);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      expect(response1.body.user.clientIds[0]._id).toBe(client._id.toString());
      expect(response2.body.user.clientIds[0]._id).toBe(client._id.toString());
    });

    it('should reject invalid role values', async () => {
      const userData = {
        email: 'invalid@interworks.com',
        password: 'Password123!',
        name: 'Invalid Role',
        role: 'admin', // Invalid role
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should still require clientIds for guest users', async () => {
      const userData = {
        email: 'guestnoclient@company.com',
        password: 'Password123!',
        name: 'Guest Without Client',
        role: 'guest',
        // Missing clientIds
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create guest user with multiple clients', async () => {
      const secondClient = await Client.create({
        name: 'Second Client Company',
        email: 'second@client.com',
      });

      const userData = {
        email: 'multiguest@company.com',
        password: 'GuestPass123!',
        name: 'Multi Client Guest',
        clientIds: [client._id.toString(), secondClient._id.toString()],
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('multiguest@company.com');
      expect(response.body.user.role).toBe('guest');
      expect(response.body.user.clientIds).toHaveLength(2);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional users
      await User.create({
        email: 'user1@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [client._id],
      });

      await User.create({
        email: 'user2@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [client._id],
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
        email: 'otherguest@company.com',
        passwordHash: 'Password123!',
        role: 'guest',
        clientIds: [otherClient._id],
      });

      const response = await request(app)
        .get(`/api/users?clientId=${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(3); // Only guests for main client
      expect(response.body.users.every((u) => u.clientIds.some(c => c._id === client._id.toString()))).toBe(true);
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

    it('should update user email', async () => {
      const updates = {
        email: 'newemail@company.com',
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newemail@company.com');
    });

    it('should update user role from guest to interworks', async () => {
      const updates = {
        role: 'interworks',
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('interworks');
      expect(response.body.user.clientIds).toEqual([]);
    });

    it('should update user clientIds (add client)', async () => {
      const secondClient = await Client.create({
        name: 'Second Client',
        email: 'second@client.com',
      });

      const updates = {
        clientIds: [client._id.toString(), secondClient._id.toString()],
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.clientIds).toHaveLength(2);
    });

    it('should update user clientIds (remove client)', async () => {
      const secondClient = await Client.create({
        name: 'Second Client',
        email: 'second@client.com',
      });

      // First add second client
      guestUser.clientIds = [client._id, secondClient._id];
      await guestUser.save();

      // Now remove second client
      const updates = {
        clientIds: [client._id.toString()],
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.clientIds).toHaveLength(1);
      expect(response.body.user.clientIds[0]._id).toBe(client._id.toString());
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

    it('should fail when removing all clientIds from guest user', async () => {
      const updates = {
        clientIds: [],
      };

      const response = await request(app)
        .put(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least one client');
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
    it('should return 409 when deleting guest user without force', async () => {
      const response = await request(app)
        .delete(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Confirmation required');
      expect(response.body.requiresForce).toBe(true);
      expect(response.body.message).toContain('guest user');
      expect(response.body.message).toContain('client(s)');

      // Verify user still exists
      const stillExists = await User.findById(guestUser._id);
      expect(stillExists).not.toBeNull();
    });

    it('should delete guest user with force=true', async () => {
      const response = await request(app)
        .delete(`/api/users/${guestUser._id}?force=true`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(guestUser._id);
      expect(deleted).toBeNull();
    });

    it('should return 409 when deleting guest with client migrations without force', async () => {
      // Create migrations for guest's client
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .delete(`/api/users/${guestUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Confirmation required');
      expect(response.body.requiresForce).toBe(true);
      expect(response.body.message).toContain('migration(s)');
      expect(response.body.migrationCount).toBe(1);

      // Verify user still exists
      const stillExists = await User.findById(guestUser._id);
      expect(stillExists).not.toBeNull();
    });

    it('should delete guest with client migrations when force=true', async () => {
      // Create migrations for guest's client
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'admin@interworks.com',
      });

      const response = await request(app)
        .delete(`/api/users/${guestUser._id}?force=true`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(guestUser._id);
      expect(deleted).toBeNull();
    });

    it('should fail to delete InterWorks user without force when they have migrations', async () => {
      // Create migration created by interworks user
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: interworksUser.email,
      });

      const response = await request(app)
        .delete(`/api/users/${interworksUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Confirmation required');
      expect(response.body.migrationCount).toBe(1);
      expect(response.body.requiresForce).toBe(true);
      expect(response.body.message).toContain('migration(s)');

      // Verify user still exists
      const stillExists = await User.findById(interworksUser._id);
      expect(stillExists).not.toBeNull();
    });

    it('should delete InterWorks user with force=true when they have migrations', async () => {
      // Create migration created by interworks user
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: interworksUser.email,
      });

      const response = await request(app)
        .delete(`/api/users/${interworksUser._id}?force=true`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(interworksUser._id);
      expect(deleted).toBeNull();
    });

    it('should return 409 when deleting InterWorks user without force (no migrations)', async () => {
      const response = await request(app)
        .delete(`/api/users/${interworksUser._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Confirmation required');
      expect(response.body.requiresForce).toBe(true);
      expect(response.body.migrationCount).toBe(0);
      expect(response.body.message).toContain('InterWorks user');
      expect(response.body.message).toContain('administrative privileges');

      // Verify user still exists
      const stillExists = await User.findById(interworksUser._id);
      expect(stillExists).not.toBeNull();
    });

    it('should delete InterWorks user without migrations when force=true', async () => {
      const response = await request(app)
        .delete(`/api/users/${interworksUser._id}?force=true`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await User.findById(interworksUser._id);
      expect(deleted).toBeNull();
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
