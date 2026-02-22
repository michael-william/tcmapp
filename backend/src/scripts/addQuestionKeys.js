/**
 * Migration Script: Add questionKey to Existing Migrations
 *
 * Adds questionKey field to all questions in existing migrations and
 * updates metadata.dependsOn references from IDs to keys.
 *
 * Safe to run multiple times (idempotent).
 */

const mongoose = require('mongoose');
const Migration = require('../models/Migration');
const { questionKeyMapping } = require('../seeds/questionKeyMapping');
require('dotenv').config();

// Build reverse mapping from ID to key
function buildKeyMap() {
  return questionKeyMapping;
}

/**
 * Add questionKey to a single migration
 */
async function migrateMigration(migration) {
  const keyMap = buildKeyMap();
  let modified = false;

  // Process main questions array
  if (migration.questions && migration.questions.length > 0) {
    migration.questions.forEach(q => {
      // Add questionKey if missing and we have a mapping
      if (!q.questionKey && keyMap[q.id]) {
        q.questionKey = keyMap[q.id];
        modified = true;
      }

      // Update dependsOn from ID to key
      if (q.metadata?.dependsOn && keyMap[q.metadata.dependsOn]) {
        q.metadata.dependsOn = keyMap[q.metadata.dependsOn];
        modified = true;
      }
    });
  }

  // Process management module questions if they exist
  if (migration.managementModule?.questions && migration.managementModule.questions.length > 0) {
    migration.managementModule.questions.forEach(q => {
      // Add questionKey if missing and we have a mapping
      if (!q.questionKey && keyMap[q.id]) {
        q.questionKey = keyMap[q.id];
        modified = true;
      }

      // Update dependsOn from ID to key
      if (q.metadata?.dependsOn && keyMap[q.metadata.dependsOn]) {
        q.metadata.dependsOn = keyMap[q.metadata.dependsOn];
        modified = true;
      }
    });
  }

  return { modified, migration };
}

/**
 * Main migration function
 */
async function addQuestionKeys(dryRun = false) {
  const startTime = Date.now();

  console.log('\n========================================');
  console.log('Add questionKey Migration Script');
  console.log('========================================\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log(`Database: ${process.env.MONGODB_URI}\n`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Fetch all migrations
    console.log('Fetching migrations...');
    const migrations = await Migration.find({});
    console.log(`✓ Found ${migrations.length} migrations\n`);

    if (migrations.length === 0) {
      console.log('No migrations to process.\n');
      await mongoose.connection.close();
      return;
    }

    // Process each migration
    let updatedCount = 0;
    let unchangedCount = 0;
    const results = [];

    for (const migration of migrations) {
      const { modified, migration: updatedMigration } = await migrateMigration(migration);

      if (modified) {
        updatedCount++;

        if (!dryRun) {
          // Mark questions arrays as modified so Mongoose saves them
          updatedMigration.markModified('questions');
          if (updatedMigration.managementModule?.questions) {
            updatedMigration.markModified('managementModule.questions');
          }

          await updatedMigration.save();
        }

        results.push({
          clientName: migration.clientInfo?.clientName || 'Unknown',
          id: migration._id.toString(),
          questionsCount: migration.questions.length,
          managementQuestionsCount: migration.managementModule?.questions?.length || 0,
        });
      } else {
        unchangedCount++;
      }
    }

    // Display results
    console.log('========================================');
    console.log('Migration Results');
    console.log('========================================\n');

    if (updatedCount > 0) {
      console.log(`✓ Updated Migrations: ${updatedCount}\n`);

      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.clientName}`);
        console.log(`   ID: ${result.id}`);
        console.log(`   Questions: ${result.questionsCount}`);
        if (result.managementQuestionsCount > 0) {
          console.log(`   Management Questions: ${result.managementQuestionsCount}`);
        }
        console.log('');
      });
    }

    if (unchangedCount > 0) {
      console.log(`  Unchanged Migrations: ${unchangedCount}`);
    }

    console.log('\n========================================');
    console.log('Summary');
    console.log('========================================\n');
    console.log(`Total Migrations: ${migrations.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Unchanged: ${unchangedCount}`);

    if (dryRun) {
      console.log('\n🔍 DRY RUN - No changes were saved');
    } else {
      console.log('\n✓ All changes saved successfully');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nCompleted in ${duration}s\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    console.error(error.stack);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }

    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

// Run if called directly
if (require.main === module) {
  addQuestionKeys(dryRun);
}

module.exports = { addQuestionKeys, migrateMigration };
