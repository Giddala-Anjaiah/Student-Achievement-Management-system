const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_achievements';

const addSampleStudentsForCSV = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Sample students data matching the CSV file
    const sampleStudents = [
      {
        name: 'John Smith',
        email: 'john.smith@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        department: 'Electrical Engineering'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU003',
        department: 'Mechanical Engineering'
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU004',
        department: 'Arts and Humanities'
      },
      {
        name: 'David Lee',
        email: 'david.lee@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU005',
        department: 'Computer Science'
      },
      {
        name: 'Lisa Chen',
        email: 'lisa.chen@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU006',
        department: 'Computer Science'
      },
      {
        name: 'Alex Garcia',
        email: 'alex.garcia@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU007',
        department: 'Computer Science'
      },
      {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU008',
        department: 'Political Science'
      },
      {
        name: 'James Taylor',
        email: 'james.taylor@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU009',
        department: 'Music'
      },
      {
        name: 'Anna Kumar',
        email: 'anna.kumar@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU010',
        department: 'Public Health'
      },
      {
        name: 'Robert White',
        email: 'robert.white@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU011',
        department: 'Mathematics'
      },
      {
        name: 'Sophia Patel',
        email: 'sophia.patel@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU012',
        department: 'Mechanical Engineering'
      },
      {
        name: 'Daniel Martinez',
        email: 'daniel.martinez@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU013',
        department: 'Dance'
      },
      {
        name: 'Olivia Thompson',
        email: 'olivia.thompson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU014',
        department: 'Business Administration'
      },
      {
        name: 'William Anderson',
        email: 'william.anderson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU015',
        department: 'Physics'
      },
      {
        name: 'Ava Jackson',
        email: 'ava.jackson@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU016',
        department: 'Computer Science'
      },
      {
        name: 'Ethan Martin',
        email: 'ethan.martin@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU017',
        department: 'Fine Arts'
      },
      {
        name: 'Isabella Clark',
        email: 'isabella.clark@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU018',
        department: 'Theater'
      },
      {
        name: 'Noah Lewis',
        email: 'noah.lewis@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU019',
        department: 'Environmental Science'
      },
      {
        name: 'Chloe Hall',
        email: 'chloe.hall@university.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU020',
        department: 'Mathematics'
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    // Check if students already exist and create them
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
        console.log(`✓ Created student: ${studentData.name} (${studentData.email})`);
        createdCount++;
      } else {
        console.log(`- Student already exists: ${studentData.name} (${studentData.email})`);
        existingCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Created: ${createdCount} students`);
    console.log(`Already existed: ${existingCount} students`);
    console.log('Total: 20 students ready for CSV import');
    console.log('\nYou can now use the sample_data_with_students.csv file for testing!');
    
    process.exit(0);

  } catch (error) {
    console.error('Error adding sample students:', error);
    process.exit(1);
  }
};

addSampleStudentsForCSV(); 