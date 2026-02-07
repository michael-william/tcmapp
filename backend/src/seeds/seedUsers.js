/**
 * Seed Users
 *
 * Creates initial users for development and testing.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const { connectDB } = require('../config/db');

async function seedUsers() {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding users...');

    // Clear existing users and clients
    await User.deleteMany({});
    await Client.deleteMany({});
    console.log('Cleared existing users and clients');

    // Create InterWorks users (no client required)
    const interworksUsers = [
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
    ];

    for (const userData of interworksUsers) {
      const user = await User.create(userData);
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    }

    // Create a test client company
    const testClient = await Client.create({
      name: 'Acme Corporation',
      email: 'contact@acme.com',
    });
    console.log(`✓ Created client: ${testClient.name}`);

    // Create guest user associated with the client
    const guestUser = await User.create({
      email: 'guest@acme.com',
      passwordHash: 'guest123',
      name: 'Guest User',
      role: 'guest',
      clientIds: [testClient._id],
    });
    console.log(`✓ Created user: ${guestUser.email} (${guestUser.role})`);

    console.log('\nSeed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin:      admin@interworks.com / admin123');
    console.log('  Consultant: consultant@interworks.com / consultant123');
    console.log('  Guest:      guest@acme.com / guest123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedUsers();
