const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
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
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n📋 Quick Fix Options:');
    console.log('1. Set up MongoDB Atlas (free cloud database):');
    console.log('   - Visit: https://www.mongodb.com/atlas');
    console.log('   - Follow the MONGODB_SETUP.md guide');
    console.log('2. Install MongoDB locally:');
    console.log('   - Visit: https://www.mongodb.com/try/download/community');
    console.log('\n⚠️  Server will continue running without database...');
    
    // Don't exit the process, let the server run for API testing
    return null;
  }
};

module.exports = connectDB;
