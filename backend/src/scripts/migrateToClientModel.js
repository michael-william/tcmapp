/**
 * Data Migration Script: Client/Guest Architecture
 *
 * Migrates existing data to new Client/Guest architecture:
 * 1. Creates Client documents from unique clientEmail values in migrations
 * 2. Updates Migration.clientEmail → Migration.clientId
 * 3. Updates User.role 'client' → 'guest' and sets User.clientId
 *
 * Usage: node src/scripts/migrateToClientModel.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Import models
const User = require('../models/User');
const Client = require('../models/Client');
const Migration = require('../models/Migration');

/**
 * Run the migration
 */
async function runMigration() {
  console.log('Starting Client/Guest architecture migration...\n');

  try {
    // Connect to database
    await connectDB();

    // Step 1: Get all unique client emails from migrations
    console.log('Step 1: Finding unique client emails from migrations...');
    const migrations = await Migration.find({}).select('clientEmail clientInfo');

    if (migrations.length === 0) {
      console.log('No migrations found. Nothing to migrate.');
      process.exit(0);
    }

    const uniqueClientEmails = [...new Set(migrations.map(m => m.clientEmail))];
    console.log(`Found ${uniqueClientEmails.length} unique client email(s):\n`, uniqueClientEmails);

    // Step 2: Create Client documents for each unique email
    console.log('\nStep 2: Creating Client documents...');
    const clientMap = {}; // Map email -> Client._id

    for (const email of uniqueClientEmails) {
      // Check if client already exists
      let client = await Client.findOne({ email });

      if (!client) {
        // Find a migration with this email to get client name
        const migration = migrations.find(m => m.clientEmail === email);
        const clientName = migration?.clientInfo?.clientName || email.split('@')[0];

        // Create new client
        client = await Client.create({
          email,
          name: clientName,
        });

        console.log(`  ✓ Created client: ${client.name} (${client.email})`);
      } else {
        console.log(`  ⊙ Client already exists: ${client.name} (${client.email})`);
      }

      clientMap[email] = client._id;
    }

    // Step 3: Update migrations to use clientId instead of clientEmail
    console.log('\nStep 3: Updating migrations with clientId...');
    let migrationsUpdated = 0;

    for (const migration of migrations) {
      const clientId = clientMap[migration.clientEmail];

      if (!clientId) {
        console.log(`  ✗ Warning: No client found for ${migration.clientEmail}`);
        continue;
      }

      // Update migration (need to use updateOne to bypass validation)
      await mongoose.connection.collection('migrations').updateOne(
        { _id: migration._id },
        {
          $set: { clientId: clientId },
          $unset: { clientEmail: "" }
        }
      );

      migrationsUpdated++;
    }

    console.log(`  ✓ Updated ${migrationsUpdated} migration(s)`);

    // Step 4: Update users with 'client' role to 'guest' role with clientId
    console.log('\nStep 4: Updating users from "client" to "guest" role...');
    const clientUsers = await User.find({ role: 'client' });

    if (clientUsers.length === 0) {
      console.log('  No client users found to migrate.');
    } else {
      let usersUpdated = 0;

      for (const user of clientUsers) {
        // Find client by email match
        const clientId = clientMap[user.email];

        if (!clientId) {
          console.log(`  ✗ Warning: No client found for user ${user.email}`);
          continue;
        }

        // Update user
        await mongoose.connection.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              role: 'guest',
              clientId: clientId
            }
          }
        );

        usersUpdated++;
        console.log(`  ✓ Updated user: ${user.email} → guest for client ${clientId}`);
      }

      console.log(`  ✓ Updated ${usersUpdated} user(s)`);
    }

    // Step 5: Verify migration
    console.log('\nStep 5: Verifying migration...');

    const clientCount = await Client.countDocuments();
    const guestCount = await User.countDocuments({ role: 'guest' });
    const migrationsWithClientId = await Migration.countDocuments({ clientId: { $exists: true } });
    const oldClientUsers = await User.countDocuments({ role: 'client' });

    console.log(`  ✓ Total clients: ${clientCount}`);
    console.log(`  ✓ Total guest users: ${guestCount}`);
    console.log(`  ✓ Migrations with clientId: ${migrationsWithClientId}`);
    console.log(`  ✓ Old "client" role users remaining: ${oldClientUsers}`);

    if (oldClientUsers > 0) {
      console.log('\n  ⚠ Warning: Some users with "client" role still exist. Review manually.');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the application with the new schema');
    console.log('2. Verify all migrations are accessible');
    console.log('3. Verify guest users can log in and see their client\'s migrations');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
