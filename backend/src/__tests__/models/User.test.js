/**
 * User Model Tests
 *
 * Tests for the User model including validation, password hashing, and methods.
 */

const User = require('../../models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@interworks.com',
        passwordHash: 'Password123!',
        name: 'Test User',
        role: 'interworks',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@interworks.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('interworks');
      expect(user.passwordHash).not.toBe('Password123!'); // Should be hashed
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should default role to client', async () => {
      const userData = {
        email: 'client@company.com',
        passwordHash: 'Password123!',
      };

      const user = await User.create(userData);
      expect(user.role).toBe('client');
    });

    it('should lowercase email', async () => {
      const userData = {
        email: 'Test@InterWorks.COM',
        passwordHash: 'Password123!',
        role: 'interworks',
      };

      const user = await User.create(userData);
      expect(user.email).toBe('test@interworks.com');
    });
  });

  describe('Validation', () => {
    it('should fail without email', async () => {
      const userData = {
        passwordHash: 'Password123!',
        role: 'client',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail without password', async () => {
      const userData = {
        email: 'test@interworks.com',
        role: 'client',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        email: 'not-an-email',
        passwordHash: 'Password123!',
        role: 'client',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with invalid role', async () => {
      const userData = {
        email: 'test@interworks.com',
        passwordHash: 'Password123!',
        role: 'admin', // Invalid role
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@interworks.com',
        passwordHash: 'Password123!',
        role: 'interworks',
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      const plainPassword = 'Password123!';
      const user = await User.create({
        email: 'hash@interworks.com',
        passwordHash: plainPassword,
        role: 'interworks',
      });

      expect(user.passwordHash).not.toBe(plainPassword);
      expect(user.passwordHash.length).toBeGreaterThan(20);
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        email: 'nohash@interworks.com',
        passwordHash: 'Password123!',
        role: 'interworks',
      });

      const originalHash = user.passwordHash;
      user.name = 'Updated Name';
      await user.save();

      expect(user.passwordHash).toBe(originalHash);
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'Password123!';
      const user = await User.create({
        email: 'compare@interworks.com',
        passwordHash: plainPassword,
        role: 'interworks',
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'compare2@interworks.com',
        passwordHash: 'Password123!',
        role: 'interworks',
      });

      const isMatch = await user.comparePassword('WrongPassword!');
      expect(isMatch).toBe(false);
    });
  });

  describe('toJSON Method', () => {
    it('should not include passwordHash in JSON', async () => {
      const user = await User.create({
        email: 'json@interworks.com',
        passwordHash: 'Password123!',
        role: 'interworks',
      });

      const userJSON = user.toJSON();
      expect(userJSON.passwordHash).toBeUndefined();
      expect(userJSON.email).toBe('json@interworks.com');
    });
  });
});
