const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_achievements';

const addVVITStudents = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // VVIT students data based on the error messages
    const vvitStudents = [
      {
        name: 'Student 0567',
        email: '22bq1a0567@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0567',
        department: 'Computer Science'
      },
      {
        name: 'Student 0568',
        email: '22bq1a0568@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0568',
        department: 'Computer Science'
      },
      {
        name: 'Student 0569',
        email: '22bq1a0569@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0569',
        department: 'Computer Science'
      },
      {
        name: 'Student 0570',
        email: '22bq1a0570@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0570',
        department: 'Computer Science'
      },
      {
        name: 'Student 0571',
        email: '22bq1a0571@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0571',
        department: 'Computer Science'
      },
      {
        name: 'Student 0572',
        email: '22bq1a0572@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0572',
        department: 'Computer Science'
      },
      {
        name: 'Student 0573',
        email: '22bq1a0573@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0573',
        department: 'Computer Science'
      },
      {
        name: 'Student 0574',
        email: '22bq1a0574@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0574',
        department: 'Computer Science'
      },
      {
        name: 'Student 0575',
        email: '22bq1a0575@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0575',
        department: 'Computer Science'
      },
      {
        name: 'Student 0576',
        email: '22bq1a0576@vvit.net',
        password: 'password123',
        role: 'student',
        studentId: '22BQ1A0576',
        department: 'Computer Science'
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    // Check if students already exist and create them
    for (const studentData of vvitStudents) {
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
        console.log(`✓ Created student: ${studentData.name} (${studentData.email})`);
        createdCount++;
      } else {
        console.log(`- Student already exists: ${studentData.name} (${studentData.email})`);
        existingCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Created: ${createdCount} VVIT students`);
    console.log(`Already existed: ${existingCount} students`);
    console.log('Total: 10 VVIT students ready for CSV import');
    console.log('\nYou can now import your updated_student_achievement.csv file!');
    
    process.exit(0);

  } catch (error) {
    console.error('Error adding VVIT students:', error);
    process.exit(1);
  }
};

addVVITStudents(); 