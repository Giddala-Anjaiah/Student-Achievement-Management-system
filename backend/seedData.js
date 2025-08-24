const mongoose = require('mongoose');
const User = require('./models/User');
const Achievement = require('./models/Achievement');
const Notification = require('./models/Notification');

// Connect to MongoDB
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_achievements';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Achievement.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        department: 'Engineering',
        isActive: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU003',
        department: 'Mathematics',
        isActive: true
      },
      {
        name: 'Dr. Robert Wilson',
        email: 'robert.wilson@university.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
        isActive: true
      },
      {
        name: 'Dr. Sarah Brown',
        email: 'sarah.brown@university.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Engineering',
        isActive: true
      },
      {
        name: 'Admin User',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
        isActive: true
      }
    ]);

    console.log('Created users:', users.length);

    // Create sample achievements
    const achievements = await Achievement.create([
      {
        title: 'First Place in Coding Competition',
        description: 'Won first place in the annual university coding competition',
        category: 'technical',
        level: 'university',
        date: new Date('2024-01-15'),
        organization: 'University Computer Science Department',
        status: 'approved',
        studentId: users[0]._id,
        studentName: users[0].name,
        validatedBy: users[3]._id,
        validatedAt: new Date('2024-01-16'),
        points: 100
      },
      {
        title: 'Research Paper Publication',
        description: 'Published research paper in IEEE conference',
        category: 'academic',
        level: 'international',
        date: new Date('2024-02-10'),
        organization: 'IEEE',
        status: 'pending',
        studentId: users[1]._id,
        studentName: users[1].name
      },
      {
        title: 'Hackathon Winner',
        description: 'Won the 24-hour hackathon competition',
        category: 'technical',
        level: 'national',
        date: new Date('2024-03-05'),
        organization: 'TechCorp',
        status: 'approved',
        studentId: users[2]._id,
        studentName: users[2].name,
        validatedBy: users[4]._id,
        validatedAt: new Date('2024-03-06'),
        points: 150
      },
      {
        title: 'Internship at Google',
        description: 'Completed summer internship at Google',
        category: 'extracurricular',
        level: 'international',
        date: new Date('2024-06-01'),
        organization: 'Google',
        status: 'approved',
        studentId: users[0]._id,
        studentName: users[0].name,
        validatedBy: users[3]._id,
        validatedAt: new Date('2024-06-02'),
        points: 200
      },
      {
        title: 'Mathematics Olympiad',
        description: 'Participated in national mathematics olympiad',
        category: 'academic',
        level: 'national',
        date: new Date('2024-04-20'),
        organization: 'Mathematics Association',
        status: 'pending',
        studentId: users[2]._id,
        studentName: users[2].name
      },
      {
        title: 'Open Source Contribution',
        description: 'Made significant contributions to open source projects',
        category: 'technical',
        level: 'international',
        date: new Date('2024-05-10'),
        organization: 'GitHub',
        status: 'approved',
        studentId: users[1]._id,
        studentName: users[1].name,
        validatedBy: users[4]._id,
        validatedAt: new Date('2024-05-11'),
        points: 80
      }
    ]);

    console.log('Created achievements:', achievements.length);

    // Create sample notifications
    const notifications = await Notification.create([
      {
        userId: users[0]._id,
        title: 'Achievement Approved',
        message: 'Your achievement "First Place in Coding Competition" has been approved!',
        type: 'achievement_approved',
        read: false,
        relatedAchievement: achievements[0]._id
      },
      {
        userId: users[1]._id,
        title: 'Achievement Submitted',
        message: 'Your achievement "Research Paper Publication" has been submitted for review.',
        type: 'general',
        read: false,
        relatedAchievement: achievements[1]._id
      },
      {
        userId: users[2]._id,
        title: 'Achievement Approved',
        message: 'Your achievement "Hackathon Winner" has been approved!',
        type: 'achievement_approved',
        read: true,
        relatedAchievement: achievements[2]._id
      }
    ]);

    console.log('Created notifications:', notifications.length);
    console.log('Database seeded successfully!');

    // Display summary
    const totalUsers = await User.countDocuments();
    const totalAchievements = await Achievement.countDocuments();
    const pendingAchievements = await Achievement.countDocuments({ status: 'pending' });
    const totalNotifications = await Notification.countDocuments();

    console.log('\nDatabase Summary:');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Achievements: ${totalAchievements}`);
    console.log(`Pending Achievements: ${pendingAchievements}`);
    console.log(`Total Notifications: ${totalNotifications}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData(); 