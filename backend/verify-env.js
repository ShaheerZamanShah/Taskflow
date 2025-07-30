// Simple environment verification
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const results = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '5000',
  hasMongoUri: !!process.env.MONGODB_URI,
  hasJwtSecret: !!process.env.JWT_SECRET,
  mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 25) + '...' : 'NOT SET'
};

console.log('\n=== ENVIRONMENT CHECK RESULTS ===');
console.log('NODE_ENV:', results.nodeEnv);
console.log('PORT:', results.port);
console.log('MongoDB URI:', results.hasMongoUri ? '✅ CONFIGURED' : '❌ NOT SET');
console.log('JWT Secret:', results.hasJwtSecret ? '✅ CONFIGURED' : '❌ NOT SET');
if (results.hasMongoUri) {
  console.log('MongoDB Preview:', results.mongoUriStart);
}

if (results.hasMongoUri && results.hasJwtSecret) {
  console.log('\n🎉 ENVIRONMENT IS PROPERLY CONFIGURED!');
  console.log('✅ Ready for production deployment');
} else {
  console.log('\n⚠️  MISSING CONFIGURATION');
  if (!results.hasMongoUri) console.log('❌ Please set MONGODB_URI');
  if (!results.hasJwtSecret) console.log('❌ Please set JWT_SECRET');
}

console.log('===================================\n');
