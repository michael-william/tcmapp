/**
 * Database Migration Script: Add Management Module Field
 *
 * Adds managementModule field to existing migrations with default enabled=false.
 * This is a one-time migration script.
 *
 * Usage: node src/scripts/addManagementModule.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Migration = require('../models/Migration');

const addManagementModule = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count migrations that need updating
    const migrationsWithoutManagement = await Migration.countDocuments({
      managementModule: { $exists: false },
    });

    console.log(`Found ${migrationsWithoutManagement} migrations without managementModule field`);

    if (migrationsWithoutManagement === 0) {
      console.log('All migrations already have managementModule field. Nothing to update.');
      process.exit(0);
    }

    // Update all migrations to add managementModule field
    const result = await Migration.updateMany(
      { managementModule: { $exists: false } },
      {
        $set: {
          managementModule: {
            enabled: false,
            weeklyNotes: [],
          },
        },
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} migrations`);
    console.log('Migration complete!');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
addManagementModule();
