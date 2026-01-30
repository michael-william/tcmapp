/**
 * Database Migration Script: Convert clientId to clientIds array
 *
 * This script migrates the User model from:
 *   clientId: ObjectId (single)
 * To:
 *   clientIds: [ObjectId] (array)
 *
 * Usage:
 *   node src/scripts/migrateToMultiClient.js --dry-run  # Preview changes
 *   node src/scripts/migrateToMultiClient.js             # Execute migration
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Use current User model to read data, then update manually
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['interworks', 'guest'], default: 'guest' },
  name: String,
  clientId: mongoose.Schema.Types.ObjectId,  // Old field
  clientIds: [mongoose.Schema.Types.ObjectId], // New field
}, { timestamps: true, strict: false });

const User = mongoose.model('User', userSchema);

async function migrateToMultiClient(dryRun = false) {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Find all users that need migration
    const usersWithOldSchema = await User.find({
      clientId: { $exists: true }
    });

    const usersWithoutClientId = await User.find({
      clientId: { $exists: false },
      clientIds: { $exists: false }
    });

    console.log(`Found ${usersWithOldSchema.length} users with old clientId field`);
    console.log(`Found ${usersWithoutClientId.length} users without any client field`);
    console.log(`Total users to migrate: ${usersWithOldSchema.length + usersWithoutClientId.length}\n`);

    if (dryRun) {
      console.log('=== DRY RUN MODE - No changes will be made ===\n');
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Migrate users with clientId -> clientIds: [clientId]
    for (const user of usersWithOldSchema) {
      try {
        console.log(`${dryRun ? '[DRY RUN] ' : ''}Migrating user: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Old clientId: ${user.clientId || 'null'}`);
        console.log(`  New clientIds: ${user.clientId ? `[${user.clientId}]` : '[]'}`);

        if (!dryRun) {
          // Update with raw MongoDB operation to avoid validation issues
          await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            {
              $set: { clientIds: user.clientId ? [user.clientId] : [] },
              $unset: { clientId: "" }
            }
          );
        }

        migratedCount++;
        console.log(`  ✓ ${dryRun ? 'Would migrate' : 'Migrated'}\n`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error migrating ${user.email}: ${error.message}\n`);
      }
    }

    // Handle users without any client field (set clientIds to empty array)
    for (const user of usersWithoutClientId) {
      try {
        console.log(`${dryRun ? '[DRY RUN] ' : ''}Migrating user without client field: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Setting clientIds: []`);

        if (!dryRun) {
          await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { clientIds: [] } }
          );
        }

        migratedCount++;
        console.log(`  ✓ ${dryRun ? 'Would migrate' : 'Migrated'}\n`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error migrating ${user.email}: ${error.message}\n`);
      }
    }

    // Verification: Check all users now have clientIds
    if (!dryRun) {
      console.log('\n=== Verification ===');
      const totalUsers = await User.countDocuments();
      const usersWithClientIds = await User.countDocuments({ clientIds: { $exists: true } });
      const usersStillWithClientId = await User.countDocuments({ clientId: { $exists: true } });

      console.log(`Total users: ${totalUsers}`);
      console.log(`Users with clientIds field: ${usersWithClientIds}`);
      console.log(`Users still with old clientId field: ${usersStillWithClientId}`);

      if (usersWithClientIds === totalUsers && usersStillWithClientId === 0) {
        console.log('✓ Migration successful! All users have been migrated.\n');
      } else {
        console.log('✗ Migration incomplete. Some users may need manual intervention.\n');
      }
    }

    // Summary
    console.log('=== Migration Summary ===');
    console.log(`${dryRun ? 'Would migrate' : 'Migrated'}: ${migratedCount} users`);
    console.log(`Errors: ${errorCount} users`);

    if (dryRun) {
      console.log('\nTo execute migration, run without --dry-run flag');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run migration
migrateToMultiClient(dryRun)
  .then(() => {
    console.log('\n✓ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration script failed:', error);
    process.exit(1);
  });
