/**
 * Migration Script: Add isOptional flag to Additional Notes questions
 *
 * This script updates existing migrations in the database to mark
 * ALL "Additional Notes" questions as optional. This ensures
 * they don't count toward progress tracking or section completion.
 *
 * Strategy: Mark any question whose text contains "Additional note" (case-insensitive)
 * This works across different migration templates where question IDs may vary.
 *
 * Usage: npm run migrate:optional
 */

const mongoose = require('mongoose');
const Migration = require('../models/Migration');
require('dotenv').config();

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
      console.log(`\nProcessing migration: ${migration._id}`);

      // Mark questions that contain "Additional note" in their text
      for (const question of migration.questions) {
        // Check if question text contains "additional note" (case-insensitive)
        const questionTextLower = question.questionText?.toLowerCase() || '';
        const isAdditionalNote = questionTextLower.includes('additional note');

        if (isAdditionalNote) {
          console.log(`  Found additional note question: ${question.id} - "${question.questionText}"`);
          console.log(`    Current isOptional: ${question.metadata?.isOptional}`);

          // Only update if not already marked as optional
          if (!question.metadata) {
            question.metadata = {};
          }

          if (!question.metadata.isOptional) {
            question.metadata.isOptional = true;
            migrationModified = true;
            questionsUpdated++;
            console.log(`    ✓ Marked as optional`);
          } else {
            console.log(`    Already marked as optional, skipping`);
          }
        }
      }

      // Save if modified
      if (migrationModified) {
        console.log(`  Saving migration...`);
        migration.markModified('questions');
        await migration.save();
        updatedCount++;
        console.log(`  ✓ Updated migration: ${migration._id}`);
      } else {
        console.log(`  No changes needed for this migration`);
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
