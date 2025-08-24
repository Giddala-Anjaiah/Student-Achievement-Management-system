const csv = require('csv-parser');
const fs = require('fs');

console.log('=== DEBUGGING ROLE FIELD ISSUE ===');

fs.createReadStream('test_role_issue.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log('=== ROW DATA ===');
    console.log('Raw row:', JSON.stringify(row, null, 2));
    console.log('Role field:', `"${row.role}"`);
    console.log('Role type:', typeof row.role);
    console.log('Role length:', row.role ? row.role.length : 'undefined');
    console.log('All keys:', Object.keys(row));
    console.log('All values:', Object.values(row));
    
    // Test the role extraction logic
    let role = '';
    if (row.role) role = row.role.trim().toLowerCase();
    else if (row.Role) role = row.Role.trim().toLowerCase();
    else if (row.ROLE) role = row.ROLE.trim().toLowerCase();
    else if (row['role']) role = row['role'].trim().toLowerCase();
    else if (row['Role']) role = row['Role'].trim().toLowerCase();
    
    console.log('Extracted role:', `"${role}"`);
    console.log('==================');
  })
  .on('end', () => {
    console.log('Debug completed');
  }); 