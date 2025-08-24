const csv = require('csv-parser');
const fs = require('fs');

console.log('=== DEBUGGING CSV ROLE FIELD ===');

fs.createReadStream('sample_users_test.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log('=== ROW DATA ===');
    console.log('Raw row:', row);
    console.log('Role field:', `"${row.role}"`);
    console.log('Role length:', row.role ? row.role.length : 'undefined');
    console.log('Role char codes:', row.role ? Array.from(row.role).map(c => c.charCodeAt(0)) : 'undefined');
    console.log('All fields:');
    Object.keys(row).forEach(key => {
      console.log(`  ${key}: "${row[key]}" (length: ${row[key] ? row[key].length : 0})`);
    });
    console.log('==================');
  })
  .on('end', () => {
    console.log('Debug completed');
  }); 