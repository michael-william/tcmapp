/**
 * Seed Users
 *
 * Creates initial users for development and testing.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');

const users = [
  {
    email: 'admin@interworks.com',
    passwordHash: 'admin123', // Will be hashed by User model pre-save hook
    name: 'Admin User',
    role: 'interworks',
  },
  {
    email: 'consultant@interworks.com',
    passwordHash: 'consultant123',
    name: 'Test Consultant',
    role: 'interworks',
  },
  {
    email: 'client@example.com',
    passwordHash: 'client123',
    name: 'Test Client',
    role: 'client',
  },
];

async function seedUsers() {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding users...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    }

    console.log('\nSeed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin:      admin@interworks.com / admin123');
    console.log('  Consultant: consultant@interworks.com / consultant123');
    console.log('  Client:     client@example.com / client123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedUsers();
