// Simple database cleanup script
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));
    
    // Drop all collections
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Cleaned collection: ${collection.name}`);
    }
    
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

cleanDatabase();
