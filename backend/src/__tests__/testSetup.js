/**
 * Test Setup - MongoDB Memory Server
 *
 * This file configures MongoDB Memory Server for isolated testing.
 * It runs before all tests and tears down after all tests complete.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test to ensure isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown after all tests
afterAll(async () => {
  // Close mongoose connection
  await mongoose.connection.close();

  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

module.exports = { mongoServer };
