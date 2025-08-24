// Test script to simulate achievement creation
const mongoose = require('mongoose');

// Define Achievement schema (simplified)
const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, default: 'university' },
  date: { type: Date, required: true },
  organization: { type: String, default: '' },
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  studentName: { type: String, required: true },
  status: { type: String, default: 'pending' },
  points: { type: Number, default: 0 }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

// Test data
const testRow = {
  title: "java develoj",
  description: "This is a san technical",
  category: "technical",
  level: "state",
  date: "09-03-2024",
  organization: "vvit",
  studentEmail: "Himagiri@gmail.com",
  studentName: "Himagiri",
  department: "Computer Science",
  status: "pending",
  points: "30"
};

// Simulate the exact parsing logic
let parsedDate = new Date(); // Default to current date

console.log(`Processing date:`, testRow.date, `Type: ${typeof testRow.date}`);

// Handle string dates
if (typeof testRow.date === 'string') {
  const dateStr = testRow.date.trim();
  console.log(`Processing string date: "${dateStr}"`);
  
  // Handle DD-MM-YYYY format (like "09-03-2024")
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    console.log(`Parts:`, parts);
    if (parts.length === 3) {
      if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY format
        const year = parseInt(parts[2]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[0]);
        console.log(`Parsing DD-MM-YYYY: year=${year}, month=${month}, day=${day}`);
        parsedDate = new Date(year, month, day);
        console.log(`DD-MM-YYYY parsed: ${parsedDate.toISOString()}`);
        console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
      }
    }
  }
}

// Ensure we have a valid date
if (isNaN(parsedDate.getTime())) {
  console.warn(`Date still invalid after parsing, using current date`);
  parsedDate = new Date();
}

console.log(`Final parsed date: ${parsedDate.toISOString()}`);

// Create test achievement object
const testAchievement = {
  title: testRow.title.trim(),
  description: testRow.description.trim(),
  category: testRow.category.trim().toLowerCase(),
  level: testRow.level ? testRow.level.trim().toLowerCase() : 'university',
  date: parsedDate,
  organization: testRow.organization ? testRow.organization.trim() : '',
  studentId: new mongoose.Types.ObjectId(), // Mock student ID
  studentName: testRow.studentName,
  status: testRow.status ? testRow.status.trim().toLowerCase() : 'pending',
  points: testRow.points ? parseInt(testRow.points) : 0
};

console.log('Test achievement object:', JSON.stringify(testAchievement, null, 2));

// Test if the date is valid
console.log(`Date is valid: ${!isNaN(testAchievement.date.getTime())}`);
console.log(`Date value: ${testAchievement.date}`);
console.log(`Date type: ${typeof testAchievement.date}`);
console.log(`Date instanceof Date: ${testAchievement.date instanceof Date}`); 