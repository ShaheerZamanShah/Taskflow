# TaskFlow Backend API

A robust Node.js/Express REST API for the TaskFlow task management application, featuring user authentication, task management, and analytics.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Protected routes with middleware
- Rate limiting for security

### 📋 Task Management
- CRUD operations for tasks
- Task categories with custom colors
- Priority levels (low, medium, high, urgent)
- Due dates and time tracking
- Subtasks support
- Task comments and attachments
- Recurring tasks
- Task archiving and favorites

### 📊 Analytics & Statistics
- User task statistics
- Category distribution
- Completion rates
- Time tracking analysis
- Recent activity feeds

### 🛡️ Security Features
- Helmet.js for security headers
- CORS protection
- Request rate limiting
- Input validation and sanitization
- Error handling middleware

## API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register          - Register new user
POST   /login             - User login
GET    /me                - Get current user
PUT    /profile           - Update user profile
PUT    /change-password   - Change password
POST   /logout            - Logout user
DELETE /account           - Delete user account
```

### Task Routes (`/api/tasks`)
```
GET    /                  - Get user tasks (with filtering/pagination)
GET    /:id               - Get single task
POST   /                  - Create new task
PUT    /:id               - Update task
DELETE /:id               - Delete task

POST   /:id/subtasks      - Add subtask
PUT    /:id/subtasks/:subtaskId - Update subtask
DELETE /:id/subtasks/:subtaskId - Delete subtask

POST   /:id/comments      - Add comment
GET    /stats/overview    - Get task statistics
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  preferences: {
    theme: String,
    timezone: String,
    notifications: Object
  },
  stats: {
    totalTasks: Number,
    completedTasks: Number,
    streak: Number
  }
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  userId: ObjectId,
  category: {
    name: String,
    color: String,
    icon: String
  },
  priority: String,
  status: String,
  dueDate: Date,
  estimatedTime: Number,
  actualTime: Number,
  tags: [String],
  recurring: {
    isRecurring: Boolean,
    pattern: String,
    interval: Number
  },
  subtasks: [Object],
  comments: [Object]
}
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Validation Rules

### User Registration
- Username: 3-30 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Minimum 6 characters, must contain uppercase, lowercase, and number
- Names: 1-50 characters, letters and spaces only

### Task Creation
- Title: Required, max 200 characters
- Description: Optional, max 1000 characters
- Category: Required name and valid hex color
- Priority: One of: low, medium, high, urgent
- Due date: Valid ISO 8601 date
- Estimated time: 1-10080 minutes (1 week max)

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt (12 rounds)
- Token validation on protected routes

### Rate Limiting
- 100 requests per 15 minutes per IP (general)
- 5 requests per 15 minutes for auth endpoints

### Input Validation
- Express-validator for request validation
- Mongoose schema validation
- XSS protection through sanitization

### Error Handling
- Centralized error handling middleware
- Detailed logging for debugging
- Secure error messages for production

## Development

### Scripts
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start production server
npm run test     # Run test suite
npm run lint     # Run ESLint
```

### Project Structure
```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── middleware/
│   ├── auth.js          # JWT authentication
│   └── errorHandler.js  # Error handling
├── models/
│   ├── User.js          # User schema
│   └── Task.js          # Task schema
├── routes/
│   ├── auth.js          # Authentication routes
│   └── tasks.js         # Task routes
├── server.js            # Express app setup
├── package.json
└── .env.example
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

## MongoDB Indexes

For optimal performance, the following indexes are created:

### User Collection
- `email: 1` (unique)
- `username: 1` (unique)
- `createdAt: -1`

### Task Collection
- `userId: 1, status: 1`
- `userId: 1, dueDate: 1`
- `userId: 1, priority: 1`
- `userId: 1, category.name: 1`
- `userId: 1, createdAt: -1`
- `tags: 1`

## Testing

The API includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use a secure JWT secret (32+ characters)
3. Configure MongoDB with authentication
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
7. Configure automated backups

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=super_secure_32_character_secret_key
FRONTEND_URL=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
