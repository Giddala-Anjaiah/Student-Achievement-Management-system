const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_achievements';

const addSampleStudents = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Sample students data
    const sampleStudents = [
      {
        name: 'John Smith',
        email: 'student1@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science'
      },
      {
        name: 'Sarah Johnson',
        email: 'student2@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        department: 'Electrical Engineering'
      },
      {
        name: 'Michael Brown',
        email: 'student3@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU003',
        department: 'Mechanical Engineering'
      }
    ];

    // Check if students already exist
    for (const studentData of sampleStudents) {
      const existingStudent = await User.findOne({ 
        $or: [
          { email: studentData.email },
          { studentId: studentData.studentId }
        ]
      });
      
      if (!existingStudent) {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(studentData.password, saltRounds);
        
        // Create student
        const student = new User({
          ...studentData,
          password: hashedPassword
        });
        
        await student.save();
        console.log(`Created student: ${studentData.name} (${studentData.email})`);
      } else {
        console.log(`Student already exists: ${studentData.name} (${studentData.email})`);
      }
    }

    console.log('Sample students added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error adding sample students:', error);
    process.exit(1);
  }
};

addSampleStudents(); 