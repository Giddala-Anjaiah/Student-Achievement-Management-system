# Student Achievements Management System - Frontend

A modern React-based frontend for the Student Achievements Management System, designed to track, manage, and showcase student accomplishments across academic, extracurricular, and co-curricular activities.

## 🚀 Features

### Core Modules
- **Authentication & Profile Management**
  - Login/Registration for Students, Faculty, and Administrators
  - User profile management with role-based access
  - JWT-based authentication

- **Achievement Management**
  - Submit new achievements with document uploads
  - Categorize achievements (Academic, Extracurricular, Co-curricular, etc.)
  - View and filter achievements by status and category
  - Achievement validation system for faculty/admins

- **Notifications System**
  - Real-time notifications for achievement approvals/rejections
  - Mark notifications as read
  - Delete notifications

- **Leaderboards**
  - Top achievers ranking
  - Category-specific leaderboards
  - System statistics and analytics

- **Portfolio Generation**
  - Individual student portfolios
  - Export portfolios as PDF
  - Print and share functionality
  - Category-based achievement organization

- **Admin Dashboard**
  - System-wide statistics
  - User management
  - Recent activity monitoring
  - Administrative controls

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.0
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Built-in file handling with FormData
- **PWA Support**: Service Worker for offline functionality

## 📁 Project Structure

```
src/
├── components/
│   └── Auth/
│       ├── Login.js          # User login component
│       ├── Register.js       # User registration component
│       └── Profile.js        # User profile management
├── Achievements/
│   ├── AchievementsForm.js   # Achievement submission form
│   ├── AchievementsList.js   # Achievement display and filtering
│   └── AchievementsValidation.js # Faculty/Admin validation interface
├── Notifications/
│   └── Notifications.js      # Notification management
├── Leaderboard/
│   └── Leaderboard.js        # Leaderboards and rankings
├── Portfolio/
│   └── Portfolio.js          # Student portfolio generation
├── Admin/
│   └── AdminDashboard.js     # Administrative dashboard
├── context/
│   └── AuthContext.js        # Authentication context
├── api.js                    # API service functions
├── App.js                    # Main application component
└── index.js                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (Node.js + Express + MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### API Configuration
The application is configured to connect to a backend API running on `http://localhost:5000/api`. Update the `API_BASE_URL` in `src/api.js` if your backend runs on a different port or URL.

### Authentication
The system uses JWT tokens for authentication. Tokens are automatically included in API requests and stored in localStorage.

## 👥 User Roles

### Student
- Submit achievements with supporting documents
- View personal achievements and portfolio
- Receive notifications for approval/rejection
- View leaderboards

### Faculty
- Validate student achievements (approve/reject)
- View all achievements in their department
- Access validation interface

### Administrator
- Full system access
- User management
- System statistics and monitoring
- Administrative dashboard

## 📱 Features by Role

### Student Features
- ✅ Login/Registration
- ✅ Profile Management
- ✅ Achievement Submission
- ✅ Document Upload
- ✅ Portfolio View
- ✅ Notifications
- ✅ Leaderboard Access

### Faculty Features
- ✅ Login/Profile Management
- ✅ Achievement Validation
- ✅ View All Achievements
- ✅ Notifications
- ✅ Leaderboard Access

### Admin Features
- ✅ All Faculty Features
- ✅ User Management
- ✅ System Statistics
- ✅ Administrative Dashboard
- ✅ System Monitoring

## 🔌 API Integration

The frontend integrates with the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Create new achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement
- `PUT /api/achievements/:id/validate` - Validate achievement
- `GET /api/achievements/user/:userId` - Get user achievements
- `POST /api/achievements/upload` - Upload document

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
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

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Material Design**: Modern, clean interface using Material-UI
- **Dark/Light Theme**: Theme support (can be extended)
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: Comprehensive error messages and fallbacks
- **Form Validation**: Client-side validation with helpful error messages
- **File Upload**: Drag-and-drop file upload with progress indicators
- **Search & Filter**: Advanced search and filtering capabilities
- **Pagination**: Efficient data loading for large datasets

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different interfaces for different user roles
- **Protected Routes**: Automatic redirection for unauthorized access
- **Input Validation**: Client-side and server-side validation
- **Secure File Upload**: File type and size validation

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Optimized Re-renders**: Proper use of useCallback and useMemo
- **Image Optimization**: Efficient image loading and caching
- **Bundle Optimization**: Tree shaking and code splitting

## 🧪 Testing

The application includes basic testing setup with React Testing Library. To run tests:

```bash
npm test
```

## 📦 Build and Deployment

### Production Build
```bash
npm run build
```

### Deployment
The application can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

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

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Complete authentication system
- Achievement management
- Portfolio generation
- Admin dashboard
- Leaderboards and notifications

---

**Developed by**: Student Development Team  
**Guide**: Mr. K. Mohan Krishna  
**Students**: 
- G. Anjaiah (22BQ1A0569)
- K. Samanvita (22BQ1A0595)
- K. Devi Navya Sree (22BQ1A05A8)
- D. Kavya (23BQ5A0507) 