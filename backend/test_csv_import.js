const csv = require('csv-parser');
const fs = require('fs');

console.log('Testing CSV parsing...');

fs.createReadStream('sample_users_test.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log('=== RAW ROW ===');
    console.log(JSON.stringify(row, null, 2));
    console.log('=== ROW KEYS ===');
    console.log(Object.keys(row));
    console.log('=== INDIVIDUAL FIELDS ===');
    console.log('name:', row.name, 'type:', typeof row.name);
    console.log('email:', row.email, 'type:', typeof row.email);
    console.log('password:', row.password, 'type:', typeof row.password);
    console.log('role:', row.role, 'type:', typeof row.role);
    console.log('department:', row.department, 'type:', typeof row.department);
    console.log('studentId:', row.studentId, 'type:', typeof row.studentId);
    console.log('isActive:', row.isActive, 'type:', typeof row.isActive);
    console.log('========================');
  })
  .on('end', () => {
    console.log('CSV parsing test completed');
  }); 