require('dotenv').config();

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('MongoDB URI first 20 chars:', process.env.MONGODB_URI.substring(0, 20) + '...');
} else {
  console.log('❌ MONGODB_URI is not set!');
}
