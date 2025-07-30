# TaskFlow MERN Stack Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites Installation

#### 1. Node.js Installation
- Download and install Node.js (v14 or higher) from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

#### 2. MongoDB Installation
Choose one of the following options:

**Option A: Local MongoDB Installation**
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Create cluster and get connection string
- Update `MONGODB_URI` in backend `.env` file

#### 3. Git (Optional)
- Download from [git-scm.com](https://git-scm.com/)

### 📁 Project Setup

#### 1. Clone/Download Project
```bash
# If using Git
git clone <repository-url>
cd TaskFlow-MERN

# Or download and extract ZIP file
```

#### 2. Install Dependencies
```bash
# Install root dependencies (for development scripts)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Environment Configuration
```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env file with your settings (see below)
```

**Backend .env Configuration:**
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/taskflow

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow

# Generate a secure JWT secret (32+ characters)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
```

#### 4. Start Development Servers

**Option A: Start Both Servers Together (Recommended)**
```bash
# From root directory
npm run dev
```

**Option B: Start Servers Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 🔧 Development Commands

#### Root Level Commands
```bash
npm run dev                 # Start both backend and frontend
npm run backend:dev         # Start only backend
npm run frontend:dev        # Start only frontend
npm run install:all         # Install all dependencies
npm test                    # Run all tests
npm run build              # Build frontend for production
```

#### Backend Commands
```bash
cd backend
npm run dev                # Start with nodemon (auto-restart)
npm start                  # Start production server
npm test                   # Run backend tests
npm run lint              # Check code style
```

#### Frontend Commands
```bash
cd frontend
npm start                  # Start development server
npm run build             # Build for production
npm test                  # Run frontend tests
npm run eject             # Eject from Create React App
```

### 📊 Database Setup

#### MongoDB Collections
The application will automatically create the following collections:
- `users` - User accounts and preferences
- `tasks` - Task data and metadata

#### Initial Data
- No initial data required
- First user registration will create the database

### 🌐 API Testing

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Register User (Example)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login User (Example)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Password123"
  }'
```

### 🐛 Troubleshooting

#### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
- Start MongoDB service locally
- Check MongoDB Atlas connection string
- Verify firewall settings
- Ensure MongoDB is installed correctly

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::5000
```
**Solutions:**
- Stop other applications using port 5000/3000
- Change port in .env file
- Kill process: `pkill -f node` (Unix) or Task Manager (Windows)

**3. JWT Secret Error**
```
Error: secretOrPrivateKey has a value which is not a string
```
**Solutions:**
- Set JWT_SECRET in backend .env file
- Use minimum 32 characters for security

**4. Frontend Can't Connect to Backend**
```
Network Error or CORS Error
```
**Solutions:**
- Verify backend is running on port 5000
- Check CORS configuration in backend/server.js
- Ensure REACT_APP_API_URL is correct

**5. Module Not Found Errors**
```
Cannot find module 'react'
```
**Solutions:**
- Run `npm install` in frontend directory
- Delete node_modules and package-lock.json, then reinstall
- Check Node.js and npm versions

### 📱 Testing the Application

#### Manual Testing Checklist
1. ✅ Backend health endpoint responds
2. ✅ User registration works
3. ✅ User login works
4. ✅ Frontend loads without errors
5. ✅ Can create tasks
6. ✅ Can view dashboard
7. ✅ Navigation works

#### Automated Testing
```bash
# Run all tests
npm test

# Backend tests only
cd backend && npm test

# Frontend tests only
cd frontend && npm test
```

### 🚀 Production Deployment

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow
JWT_SECRET=production_secure_secret_key_32_chars_minimum
FRONTEND_URL=https://yourdomain.com
```

#### Build Commands
```bash
# Build frontend
cd frontend
npm run build

# The build folder contains production-ready files
```

#### Deployment Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: MongoDB Atlas (recommended)

### 📞 Support

If you encounter issues:
1. Check this setup guide first
2. Review error messages carefully
3. Check GitHub Issues
4. Ensure all prerequisites are installed
5. Verify environment variables are set correctly

### 🎯 Next Steps

Once setup is complete:
1. Create your first user account
2. Explore the dashboard
3. Create some tasks
4. Test different features
5. Customize the application as needed

---

**Happy Coding! 🚀**
