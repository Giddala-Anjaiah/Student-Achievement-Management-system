// Test script to debug date parsing
const testDate = "15-01-2024";
console.log(`Testing date: "${testDate}"`);

// Method 1: Direct parsing
const directDate = new Date(testDate);
console.log(`Direct parsing: ${directDate}, Valid: ${!isNaN(directDate.getTime())}`);

// Method 2: DD-MM-YYYY parsing
const parts = testDate.split('-');
if (parts.length === 3) {
  const parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  console.log(`DD-MM-YYYY parsing: ${parsedDate}, Valid: ${!isNaN(parsedDate.getTime())}`);
  console.log(`Parts: [${parts[0]}, ${parts[1]}, ${parts[2]}]`);
  console.log(`Parsed parts: [${parseInt(parts[2])}, ${parseInt(parts[1]) - 1}, ${parseInt(parts[0])}]`);
}

// Method 3: Convert to YYYY-MM-DD
const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
const isoDate = new Date(convertedDate);
console.log(`Converted to YYYY-MM-DD: ${convertedDate}`);
console.log(`ISO parsing: ${isoDate}, Valid: ${!isNaN(isoDate.getTime())}`);

// Method 4: Check if it's a string or number
console.log(`Type: ${typeof testDate}`);
console.log(`Length: ${testDate.length}`);
console.log(`Contains dash: ${testDate.includes('-')}`);

// Test with different formats
const testCases = [
  "15-01-2024",
  "2024-01-15", 
  "01/15/2024",
  "2024/01/15"
];

testCases.forEach(dateStr => {
  const date = new Date(dateStr);
  console.log(`"${dateStr}" -> ${date}, Valid: ${!isNaN(date.getTime())}`);
}); 