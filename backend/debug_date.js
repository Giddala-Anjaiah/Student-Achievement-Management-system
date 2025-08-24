// Debug script to test date parsing logic
const testDate = "09-03-2024";
console.log(`Testing date: "${testDate}"`);

// Simulate the exact logic from import controller
let parsedDate = new Date(); // Default to current date

console.log(`Processing date:`, testDate, `Type: ${typeof testDate}`);

// Handle actual Date objects from Excel
if (testDate instanceof Date) {
  parsedDate = testDate;
  console.log(`Excel Date object: ${parsedDate.toISOString()}`);
}
// Handle Excel date numbers (serial numbers)
else if (typeof testDate === 'number' && testDate > 1000) {
  parsedDate = new Date((testDate - 25569) * 86400 * 1000);
  console.log(`Excel serial number converted: ${parsedDate.toISOString()}`);
}
// Handle string dates
else if (typeof testDate === 'string') {
  const dateStr = testDate.trim();
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
      } else if (parts[0].length === 4) {
        // YYYY-MM-DD format
        parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        console.log(`YYYY-MM-DD parsed: ${parsedDate.toISOString()}`);
      }
    }
  }
  
  // Try standard parsing as fallback
  if (isNaN(parsedDate.getTime())) {
    parsedDate = new Date(dateStr);
    console.log(`Standard parsing: ${parsedDate.toISOString()}`);
  }
}

// Final fallback to current date
if (isNaN(parsedDate.getTime())) {
  console.warn(`Invalid date: "${testDate}", using current date`);
  parsedDate = new Date();
}

console.log(`Final result: ${parsedDate.toISOString()}`);
console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);

// Test with different formats
const testCases = [
  "09-03-2024",
  "2024-03-09",
  "03/09/2024",
  "2024/03/09"
];

console.log("\nTesting different formats:");
testCases.forEach(dateStr => {
  const date = new Date(dateStr);
  console.log(`"${dateStr}" -> ${date.toISOString()}, Valid: ${!isNaN(date.getTime())}`);
}); 