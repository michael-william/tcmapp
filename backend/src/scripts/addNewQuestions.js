/**
 * Migration Script: Add q44 and q57 to Existing Migrations
 *
 * This script adds two new questions to existing migrations:
 * - q44: Tableau Cloud Manager URL (Tableau Cloud section)
 * - q57: Cloud Platform (Cloud Data Sources section)
 *
 * These questions were added to the template after the initial migration
 * was created on Railway, so this script ensures they exist in production.
 *
 * Strategy: Find insertion points by checking neighboring questions
 * to ensure correct positioning even if order numbers vary.
 *
 * Usage: node src/scripts/addNewQuestions.js
 */

const mongoose = require('mongoose');
const Migration = require('../models/Migration');
require('dotenv').config();

// Define the new questions based on current template
const q44 = {
  id: 'q44',
  section: 'Tableau Cloud',
  questionText: 'Tableau Cloud Manager URL',
  questionType: 'textInput',
  answer: null,
  completed: false,
  order: 44,
  metadata: {},
};

const q57 = {
  id: 'q57',
  section: 'Cloud Data Sources',
  questionText: 'Cloud Platform',
  questionType: 'multiSelect',
  options: ['AWS', 'Azure', 'GCP', 'Other', 'N/A'],
  answer: ['N/A'],
  completed: false,
  order: 56,
  metadata: {},
};

/**
 * Find the correct insertion index for a question
 * @param {Array} questions - Array of existing questions
 * @param {String} afterQuestionId - ID of question to insert after
 * @param {String} section - Section name as fallback
 * @returns {Number} - Index where question should be inserted
 */
function findInsertionIndex(questions, afterQuestionId, section) {
  // Try to find the question that should come before this one
  const afterIndex = questions.findIndex((q) => q.id === afterQuestionId);

  if (afterIndex !== -1) {
    // Insert right after the found question
    return afterIndex + 1;
  }

  // Fallback: find last question in the same section
  let lastSectionIndex = -1;
  for (let i = questions.length - 1; i >= 0; i--) {
    if (questions[i].section === section) {
      lastSectionIndex = i;
      break;
    }
  }

  if (lastSectionIndex !== -1) {
    return lastSectionIndex + 1;
  }

  // Last resort: append to end
  return questions.length;
}

async function addNewQuestions() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('Connection URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') || 'Not set');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tableau-migrations-dev');
    console.log('✓ Connected to MongoDB');

    // Find all migrations
    const migrations = await Migration.find({});
    console.log(`\nFound ${migrations.length} migration(s) to process`);

    if (migrations.length === 0) {
      console.log('No migrations found. Exiting.');
      await mongoose.connection.close();
      process.exit(0);
    }

    let migrationsUpdated = 0;
    let q44Added = 0;
    let q57Added = 0;

    // Process each migration
    for (const migration of migrations) {
      let migrationModified = false;
      console.log(`\nProcessing migration: ${migration._id}`);
      console.log(`  Client: ${migration.clientInfo?.clientName || 'N/A'}`);
      console.log(`  Total questions: ${migration.questions.length}`);

      // Check if q44 exists
      const hasQ44 = migration.questions.some((q) => q.id === 'q44');
      console.log(`  Has q44: ${hasQ44}`);

      if (!hasQ44) {
        // Find insertion point for q44 (after q43 "Custom Domains")
        const insertIndex = findInsertionIndex(
          migration.questions,
          'q43', // After "Custom Domains" question
          'Tableau Cloud'
        );

        console.log(`  Adding q44 at index ${insertIndex}`);
        migration.questions.splice(insertIndex, 0, { ...q44 });
        migrationModified = true;
        q44Added++;
      } else {
        console.log('  q44 already exists, skipping');
      }

      // Check if q57 exists
      const hasQ57 = migration.questions.some((q) => q.id === 'q57');
      console.log(`  Has q57: ${hasQ57}`);

      if (!hasQ57) {
        // Find insertion point for q57 (after q56 "What authentication is used")
        const insertIndex = findInsertionIndex(
          migration.questions,
          'q56', // After "What authentication is used to Cloud Data Sources"
          'Cloud Data Sources'
        );

        console.log(`  Adding q57 at index ${insertIndex}`);
        migration.questions.splice(insertIndex, 0, { ...q57 });
        migrationModified = true;
        q57Added++;
      } else {
        console.log('  q57 already exists, skipping');
      }

      // Save if modified
      if (migrationModified) {
        console.log('  Saving migration...');
        migration.markModified('questions');
        await migration.save();
        migrationsUpdated++;
        console.log(`  ✓ Updated migration: ${migration._id}`);
        console.log(`  New total questions: ${migration.questions.length}`);
      } else {
        console.log('  No changes needed for this migration');
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Migrations processed: ${migrations.length}`);
    console.log(`Migrations updated: ${migrationsUpdated}`);
    console.log(`q44 added to ${q44Added} migration(s)`);
    console.log(`q57 added to ${q57Added} migration(s)`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    console.error('Stack trace:', error.stack);

    // Close connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }

    process.exit(1);
  }
}

// Run the migration
addNewQuestions();
