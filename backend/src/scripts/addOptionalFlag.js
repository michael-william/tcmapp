/**
 * Migration Script: Add isOptional flag to Additional Notes questions
 *
 * This script updates existing migrations in the database to mark
 * "Additional Notes" questions (q58-q64) as optional. This ensures
 * they don't count toward progress tracking or section completion.
 *
 * Usage: npm run migrate:optional
 */

const mongoose = require('mongoose');
const Migration = require('../models/Migration');
require('dotenv').config();

// Question IDs for all "Additional Notes" questions
const OPTIONAL_QUESTION_IDS = ['q58', 'q59', 'q60', 'q61', 'q62', 'q63', 'q64'];

async function addOptionalFlag() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tableau-migrations-dev');
    console.log('✓ Connected to MongoDB');

    // Find all migrations
    const migrations = await Migration.find({});
    console.log(`\nFound ${migrations.length} migration(s) to process`);

    let updatedCount = 0;
    let questionsUpdated = 0;

    // Process each migration
    for (const migration of migrations) {
      let migrationModified = false;

      // Update questions with IDs in OPTIONAL_QUESTION_IDS
      for (const question of migration.questions) {
        if (OPTIONAL_QUESTION_IDS.includes(question.id)) {
          // Only update if not already marked as optional
          if (!question.metadata) {
            question.metadata = {};
          }

          if (!question.metadata.isOptional) {
            question.metadata.isOptional = true;
            migrationModified = true;
            questionsUpdated++;
            console.log(`  ✓ Marked ${question.id} as optional: "${question.questionText}"`);
          }
        }
      }

      // Save if modified
      if (migrationModified) {
        await migration.save();
        updatedCount++;
        console.log(`  ✓ Updated migration: ${migration._id} (${migration.clientEmail})`);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Migrations processed: ${migrations.length}`);
    console.log(`Migrations updated: ${updatedCount}`);
    console.log(`Questions marked as optional: ${questionsUpdated}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
addOptionalFlag();
