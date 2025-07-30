# TaskFlow MERN Stack Application

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). TaskFlow provides a professional, feature-rich platform for managing tasks, projects, and productivity with real-time analytics and a beautiful user interface.

## 🌟 Features

### 🎯 Task Management
- **Comprehensive CRUD Operations**: Create, read, update, and delete tasks
- **Smart Categories**: Organize tasks with custom categories, colors, and icons
- **Priority System**: Set task priorities (low, medium, high, urgent)
- **Due Dates & Reminders**: Schedule tasks with deadline tracking
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Time Tracking**: Estimate and track actual time spent on tasks
- **Recurring Tasks**: Set up daily, weekly, monthly, or yearly recurring tasks
- **Task Comments**: Add notes and updates to tasks
- **Tags & Search**: Tag tasks and search through your task list
- **Bulk Operations**: Perform actions on multiple tasks at once

### 👤 User Management
- **Secure Authentication**: JWT-based login and registration
- **User Profiles**: Customizable user profiles with preferences
- **Theme Support**: Light, dark, and auto themes
- **Notification Settings**: Configure email and in-app notifications
- **User Statistics**: Track personal productivity metrics

### 📊 Analytics & Insights
- **Dashboard Overview**: Real-time task statistics and progress
- **Completion Rates**: Track task completion percentages
- **Category Distribution**: Visual breakdown of tasks by category
- **Time Analytics**: Analyze time spent vs. estimated time
- **Productivity Streaks**: Monitor daily task completion streaks
- **Recent Activity**: View recent task updates and changes
- **Upcoming Deadlines**: Get alerts for approaching due dates

### 🎨 Professional UI/UX
- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Charts**: Beautiful data visualizations with Chart.js
- **Drag & Drop**: Intuitive task reordering and organization
- **Keyboard Shortcuts**: Power user features for efficiency
- **Loading States**: Smooth loading animations and states
- **Error Handling**: Graceful error handling with user-friendly messages

### 🔒 Security & Performance
- **Data Protection**: Secure API endpoints with authentication
- **Rate Limiting**: Protection against abuse and spam
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Logging**: Detailed error tracking for debugging
- **Performance Optimization**: Efficient database queries and caching

## 🏗️ Architecture

### Backend (Node.js/Express)
```
backend/
├── config/
│   └── database.js         # MongoDB connection setup
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── errorHandler.js    # Global error handling
├── models/
│   ├── User.js            # User schema and methods
│   └── Task.js            # Task schema with virtuals
├── routes/
│   ├── auth.js            # Authentication endpoints
│   └── tasks.js           # Task management endpoints
├── server.js              # Express app configuration
└── package.json
```

### Frontend (React/TypeScript)
```
frontend/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service functions
│   ├── context/          # React Context providers
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── styles/           # CSS and styling
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or cloud Atlas)
- **npm** or **yarn** package manager
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/taskflow-mern.git
cd taskflow-mern
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Set MONGODB_URI, JWT_SECRET, etc.

# Start development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Database Setup
Ensure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file to point to your MongoDB Atlas cluster.

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=TaskFlow
REACT_APP_VERSION=1.0.0
```

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get user tasks | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| GET | `/api/tasks/stats/overview` | Get task statistics | Yes |

### Query Parameters for GET /api/tasks
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `status`: Filter by status (pending, in-progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `category`: Filter by category name
- `tags`: Filter by tags (comma-separated)
- `search`: Search in title and description
- `sortBy`: Sort field (createdAt, dueDate, priority, title)
- `sortOrder`: Sort direction (asc, desc)
- `dueDateFrom`: Filter by due date range start
- `dueDateTo`: Filter by due date range end

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed with bcrypt),
  firstName: String (1-50 chars),
  lastName: String (1-50 chars),
  avatar: String (optional),
  preferences: {
    theme: String (light|dark|auto),
    timezone: String,
    notifications: {
      email: Boolean,
      taskReminders: Boolean,
      weeklyReports: Boolean
    },
    defaultView: String (dashboard|tasks|today|upcoming)
  },
  stats: {
    totalTasks: Number,
    completedTasks: Number,
    streak: Number,
    lastActiveDate: Date
  },
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 200 chars),
  description: String (optional, max 1000 chars),
  userId: ObjectId (ref to User),
  category: {
    name: String (required, max 50 chars),
    color: String (hex color),
    icon: String (Font Awesome class)
  },
  priority: String (low|medium|high|urgent),
  status: String (pending|in-progress|completed|cancelled),
  dueDate: Date (optional),
  completedAt: Date (auto-set when completed),
  estimatedTime: Number (minutes, 1-10080),
  actualTime: Number (minutes),
  tags: [String] (max 30 chars each),
  recurring: {
    isRecurring: Boolean,
    pattern: String (daily|weekly|monthly|yearly),
    interval: Number,
    daysOfWeek: [Number], // 0=Sunday, 6=Saturday
    endDate: Date,
    nextDueDate: Date
  },
  subtasks: [{
    title: String (required, max 200 chars),
    completed: Boolean,
    completedAt: Date,
    order: Number
  }],
  comments: [{
    text: String (required, max 500 chars),
    createdAt: Date
  }],
  reminders: [{
    datetime: Date,
    message: String (max 200 chars),
    sent: Boolean
  }],
  order: Number,
  isArchived: Boolean,
  isFavorite: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                # Run React tests
npm run test:coverage   # Run tests with coverage
```

## 🚀 Deployment

### Backend Deployment (Production)
1. **Environment Setup**:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
   JWT_SECRET=your_production_jwt_secret_32_characters_minimum
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Build and Start**:
   ```bash
   npm install --production
   npm start
   ```

### Frontend Deployment
1. **Build for Production**:
   ```bash
   npm run build
   ```

2. **Deploy to hosting service** (Netlify, Vercel, etc.)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t taskflow-backend ./backend
docker build -t taskflow-frontend ./frontend
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev         # Start with nodemon (auto-restart)
npm start          # Start production server
npm test           # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

#### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (irreversible)
```

### Code Style
- **ESLint**: Configured for both backend and frontend
- **Prettier**: Code formatting
- **TypeScript**: Type safety for frontend
- **Conventional Commits**: Commit message format

### Git Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m "feat: add amazing feature"`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create Pull Request

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- ✅ Check MongoDB is running
- ✅ Verify environment variables in `.env`
- ✅ Ensure port 5000 is available
- ✅ Check Node.js version (v14+)

#### Frontend can't connect to backend
- ✅ Verify backend is running on port 5000
- ✅ Check CORS configuration
- ✅ Verify `REACT_APP_API_URL` in frontend `.env`

#### Database connection issues
- ✅ Verify MongoDB URI format
- ✅ Check database credentials
- ✅ Ensure network access for MongoDB Atlas

#### Authentication not working
- ✅ Check JWT secret is set
- ✅ Verify token is being sent in requests
- ✅ Check token expiration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Add tests for new features
6. Ensure all tests pass
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React**: Frontend framework
- **Express.js**: Backend framework
- **MongoDB**: Database
- **Chart.js**: Data visualization
- **Font Awesome**: Icons
- **Tailwind CSS**: Styling framework
- **JWT**: Authentication
- **bcryptjs**: Password hashing

## 📞 Support

- 📧 Email: support@taskflow.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/taskflow-mern/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/taskflow-mern/wiki)

---

**Built with ❤️ by [Your Name]**

⭐ **Star this repository if you found it helpful!**
