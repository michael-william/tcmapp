/**
 * Authentication Routes Tests
 *
 * Integration tests for authentication endpoints.
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');
const { generateJWT } = require('../testHelpers');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@interworks.com',
        password: 'Password123!',
        name: 'New User',
        role: 'interworks',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('newuser@interworks.com');
      expect(response.body.user.role).toBe('interworks');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const userData = {
        email: 'not-an-email',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with short password', async () => {
      const userData = {
        email: 'test@interworks.com',
        password: 'short',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@interworks.com',
        password: 'Password123!',
      };

      // Create first user
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should default role to client', async () => {
      const userData = {
        email: 'client@company.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      if (response.status !== 201) {
        console.error('Error:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('client');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        email: 'login@interworks.com',
        passwordHash: 'Password123!',
        name: 'Login User',
        role: 'interworks',
      });
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'login@interworks.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@interworks.com');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const credentials = {
        email: 'wrong@interworks.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      const credentials = {
        email: 'login@interworks.com',
        password: 'WrongPassword!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should fail with missing password', async () => {
      const credentials = {
        email: 'login@interworks.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create a test user
      user = await User.create({
        email: 'me@interworks.com',
        passwordHash: 'Password123!',
        name: 'Me User',
        role: 'interworks',
      });

      // Generate token
      token = generateJWT({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('me@interworks.com');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should fail with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
