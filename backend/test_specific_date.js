// Test script specifically for date "15-01-2024"
const testDate = "15-01-2024";
console.log(`Testing specific date: "${testDate}"`);

// Simulate the exact logic from import controller
let parsedDate = new Date(); // Default to current date

console.log(`Processing date:`, testDate, `Type: ${typeof testDate}`);

// Handle string dates
if (typeof testDate === 'string') {
  const dateStr = testDate.trim();
  console.log(`Processing string date: "${dateStr}"`);
  
  // Handle DD-MM-YYYY format (like "15-01-2024")
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    console.log(`Date parts: [${parts.join(', ')}]`);
    if (parts.length === 3) {
      if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        console.log(`Parsing DD-MM-YYYY: day=${day}, month=${month}, year=${year}`);
        parsedDate = new Date(year, month, day);
        console.log(`DD-MM-YYYY parsed: ${parsedDate.toISOString()}`);
        console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
      }
    }
  }
  
  // Try standard parsing as fallback
  if (isNaN(parsedDate.getTime())) {
    console.log(`Trying standard date parsing for: "${dateStr}"`);
    parsedDate = new Date(dateStr);
    console.log(`Standard parsing result: ${parsedDate.toISOString()}`);
    console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
  }
}

// Ensure we have a valid date
if (isNaN(parsedDate.getTime())) {
  console.warn(`Date still invalid after parsing, using current date`);
  parsedDate = new Date();
}

console.log(`Final parsed date: ${parsedDate.toISOString()}`);
console.log(`Final date is valid: ${!isNaN(parsedDate.getTime())}`);

// Test with different approaches
console.log('\n=== Testing different approaches ===');

// Approach 1: Direct parsing
const directDate = new Date(testDate);
console.log(`Direct parsing: ${directDate}, Valid: ${!isNaN(directDate.getTime())}`);

// Approach 2: Manual parsing
const parts = testDate.split('-');
const manualDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
console.log(`Manual parsing: ${manualDate}, Valid: ${!isNaN(manualDate.getTime())}`);

// Approach 3: Convert to YYYY-MM-DD
const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
const isoDate = new Date(convertedDate);
console.log(`Converted to YYYY-MM-DD: ${convertedDate}`);
console.log(`ISO parsing: ${isoDate}, Valid: ${!isNaN(isoDate.getTime())}`); 