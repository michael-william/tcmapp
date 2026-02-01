/**
 * Database Configuration
 *
 * MongoDB connection setup with Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Validate MONGODB_URI in production
    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: MONGODB_URI environment variable is required in production');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tableau-migrations-dev';

    // Log connection attempt (mask credentials)
    console.log(`Attempting MongoDB connection to: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[CREDENTIALS]@')}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
    });

    console.log(`MongoDB connected successfully to: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
