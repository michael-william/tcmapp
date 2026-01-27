/**
 * Client Routes Tests
 *
 * Integration tests for client CRUD endpoints.
 */

const request = require('supertest');
const express = require('express');
const clientRoutes = require('../../routes/clients');
const User = require('../../models/User');
const Client = require('../../models/Client');
const Migration = require('../../models/Migration');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/clients', clientRoutes);

describe('Client Routes', () => {
  let interworksUser, interworksToken;
  let guestUser, guestToken;
  let client;

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

    // Create client for guest user
    client = await Client.create({
      name: 'Test Client',
      email: 'contact@testclient.com',
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

  describe('POST /api/clients', () => {
    it('should create client (InterWorks only)', async () => {
      const clientData = {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.client.name).toBe('Acme Corporation');
      expect(response.body.client.email).toBe('contact@acme.com');
      expect(response.body.client._id).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const clientData = {
        name: 'Another Name',
        email: 'contact@testclient.com', // Duplicate
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(clientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail without name', async () => {
      const clientData = {
        email: 'test@test.com',
        // Missing name
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(clientData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without email', async () => {
      const clientData = {
        name: 'Test Company',
        // Missing email
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(clientData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for guest users', async () => {
      const clientData = {
        name: 'Unauthorized Client',
        email: 'unauthorized@test.com',
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(clientData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'test@test.com',
      };

      await request(app).post('/api/clients').send(clientData).expect(401);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Create additional clients
      await Client.create({
        name: 'Client A',
        email: 'clienta@test.com',
      });

      await Client.create({
        name: 'Client B',
        email: 'clientb@test.com',
      });
    });

    it('should list all clients for InterWorks users', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.clients).toHaveLength(3); // Including beforeEach client
      expect(response.body.clients[0].name).toBeDefined();
      expect(response.body.clients[0].email).toBeDefined();
    });

    it('should fail for guest users', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/api/clients').expect(401);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should get client by ID for authenticated users', async () => {
      const response = await request(app)
        .get(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client._id).toBe(client._id.toString());
      expect(response.body.client.name).toBe('Test Client');
    });

    it('should allow guest users to view their own client', async () => {
      const response = await request(app)
        .get(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client._id).toBe(client._id.toString());
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/clients/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/clients/${client._id}`).expect(401);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update client (InterWorks only)', async () => {
      const updates = {
        name: 'Updated Client Name',
        email: 'updated@testclient.com',
      };

      const response = await request(app)
        .put(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client.name).toBe('Updated Client Name');
      expect(response.body.client.email).toBe('updated@testclient.com');
    });

    it('should fail with duplicate email', async () => {
      // Create another client
      const otherClient = await Client.create({
        name: 'Other Client',
        email: 'other@client.com',
      });

      const updates = {
        email: 'other@client.com', // Duplicate
      };

      const response = await request(app)
        .put(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should allow updating name only', async () => {
      const updates = {
        name: 'New Name Only',
      };

      const response = await request(app)
        .put(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client.name).toBe('New Name Only');
      expect(response.body.client.email).toBe('contact@testclient.com'); // Unchanged
    });

    it('should fail for guest users', async () => {
      const updates = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updates = {
        name: 'Test',
      };

      const response = await request(app)
        .put(`/api/clients/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .send(updates)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('should delete client with no migrations (InterWorks only)', async () => {
      const newClient = await Client.create({
        name: 'Deletable Client',
        email: 'deletable@client.com',
      });

      const response = await request(app)
        .delete(`/api/clients/${newClient._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await Client.findById(newClient._id);
      expect(deleted).toBeNull();
    });

    it('should fail to delete client with migrations', async () => {
      // Create migration for client
      await Migration.create({
        clientId: client._id,
        questions: [],
        createdBy: 'consultant@interworks.com',
      });

      const response = await request(app)
        .delete(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('migration');

      // Verify NOT deleted
      const notDeleted = await Client.findById(client._id);
      expect(notDeleted).not.toBeNull();
    });

    it('should fail for guest users', async () => {
      const response = await request(app)
        .delete(`/api/clients/${client._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/clients/${fakeId}`)
        .set('Authorization', `Bearer ${interworksToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app).delete(`/api/clients/${client._id}`).expect(401);
    });
  });
});
