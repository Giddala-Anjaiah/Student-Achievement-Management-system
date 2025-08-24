# Student Achievements Management System - Backend API

A Node.js + Express + MongoDB backend API for the Student Achievements Management System.

## 🚀 Features

### Core API Endpoints
- **Authentication**: JWT-based user authentication and authorization
- **User Management**: Student, Faculty, and Administrator roles
- **Achievement Management**: CRUD operations with file uploads
- **Validation System**: Faculty/Admin approval/rejection workflow
- **Notifications**: Real-time achievement status updates
- **Leaderboards**: Top achievers and category rankings
- **Portfolio Generation**: Student portfolio creation and export
- **Admin Dashboard**: System statistics and user management

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **CORS**: Cross-origin resource sharing

## 📁 Project Structure

```
backend/
├── controllers/           # Business logic
│   ├── authController.js
│   ├── achievementController.js
│   ├── notificationController.js
│   ├── leaderboardController.js
│   ├── portfolioController.js
│   └── adminController.js
├── models/                # MongoDB schemas
│   ├── User.js
│   ├── Achievement.js
│   └── Notification.js
├── routes/                # API routes
│   ├── auth.js
│   ├── achievements.js
│   ├── notifications.js
│   ├── leaderboard.js
│   ├── portfolio.js
│   └── admin.js
├── middleware/            # Custom middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/                 # Utility functions
│   └── jwt.js
├── uploads/               # File uploads
├── .env                   # Environment variables
├── package.json
├── server.js              # Main entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/student_achievements
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify the server**
   The API will be available at `http://localhost:5000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Achievements
- `GET /api/achievements` - Get all achievements (with filters)
- `GET /api/achievements/:id` - Get specific achievement
- `POST /api/achievements` - Create new achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement
- `PUT /api/achievements/:id/validate` - Validate achievement (Faculty/Admin)
- `GET /api/achievements/user/:userId` - Get user achievements
- `POST /api/achievements/upload` - Upload document

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Leaderboard
- `GET /api/leaderboard/top` - Get top achievers
- `GET /api/leaderboard/category/:category` - Get category leaders
- `GET /api/leaderboard/stats` - Get leaderboard statistics

### Portfolio
- `GET /api/portfolio/:userId` - Generate portfolio
- `GET /api/portfolio/:userId/export` - Export PDF

### Admin
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `GET /api/admin/stats` - Get system statistics

## 🔒 Authentication & Authorization

### JWT Token
- Tokens are required for protected routes
- Include in request headers: `Authorization: Bearer <token>`
- Token expiration: 7 days

### User Roles
- **Student**: Can create, update, delete own achievements
- **Faculty**: Can validate achievements, view all achievements
- **Admin**: Full system access, user management

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/faculty/admin),
  studentId: String (unique, required for students),
  department: String,
  isActive: Boolean,
  profilePicture: String
}
```

### Achievement Model
```javascript
{
  title: String,
  description: String,
  category: String,
  level: String,
  date: Date,
  organization: String,
  documentUrl: String,
  status: String (pending/approved/rejected),
  rejectionReason: String,
  studentId: ObjectId (ref: User),
  studentName: String,
  validatedBy: ObjectId (ref: User),
  validatedAt: Date,
  points: Number
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: String,
  read: Boolean,
  relatedAchievement: ObjectId (ref: Achievement),
  actionUrl: String
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

### File Upload
- Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX
- Maximum file size: 5MB
- Upload directory: `uploads/`

## 🧪 Testing

### Manual Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### API Documentation
Consider using Swagger/OpenAPI for API documentation.

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Set up proper CORS settings
5. Use environment variables for sensitive data

### Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS**: EC2 with MongoDB or DocumentDB
- **DigitalOcean**: Droplet with MongoDB
- **Vercel**: Serverless deployment

## 🔍 Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- File upload errors

## 📈 Performance

### Optimizations
- Database indexing on frequently queried fields
- Pagination for large datasets
- File size limits
- Request rate limiting (can be added)

### Monitoring
- Log all API requests and errors
- Monitor database performance
- Track file upload usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Developed by**: Student Development Team  
**Guide**: Mr. K. Mohan Krishna  
**Students**: 
- G. Anjaiah (22BQ1A0569)
- K. Samanvita (22BQ1A0595)
- K. Devi Navya Sree (22BQ1A05A8)
- D. Kavya (23BQ5A0507)
