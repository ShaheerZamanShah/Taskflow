#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Removes all data from the database for a clean production start
 * Run: node scripts/clean-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Import models
const Task = require('../models/Task');
const User = require('../models/User');

const cleanDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Get collection stats before cleanup
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections found:', collections.map(col => col.name).join(', '));
    
    // Count documents before cleanup
    const taskCount = await Task.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📈 Current document counts:');
    console.log(`Tasks: ${taskCount}`);
    console.log(`Users: ${userCount}`);
    
    if (taskCount === 0 && userCount === 0) {
      console.log('\n✨ Database is already clean!');
      await mongoose.connection.close();
      return;
    }
    
    // Confirm cleanup
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🧹 Starting database cleanup...');
    
    // Remove all tasks
    const taskResult = await Task.deleteMany({});
    console.log(`✅ Deleted ${taskResult.deletedCount} tasks`);
    
    // Remove all users
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    // Verify cleanup
    const remainingTasks = await Task.countDocuments();
    const remainingUsers = await User.countDocuments();
    
    console.log('\n🔍 Verification:');
    console.log(`Remaining tasks: ${remainingTasks}`);
    console.log(`Remaining users: ${remainingUsers}`);
    
    if (remainingTasks === 0 && remainingUsers === 0) {
      console.log('\n🎉 Database cleanup completed successfully!');
      console.log('Your database is now clean and ready for production.');
    } else {
      console.log('\n❌ Cleanup may not have completed successfully.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during database cleanup:', error.message);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  try {
    await mongoose.connection.close();
  } catch (error) {
    // Connection might not be open
  }
  process.exit(0);
});

// Run the cleanup
if (require.main === module) {
  cleanDatabase();
}

module.exports = cleanDatabase;
