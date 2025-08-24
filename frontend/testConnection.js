// Simple test to check if frontend can connect to backend
console.log('Testing frontend-backend connection...');

// Test if we can make a request to the backend
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@university.edu',
    password: 'password123'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Login response:', data);
  if (data.token) {
    console.log('✅ Login successful! Token received.');
    
    // Test admin dashboard with token
    return fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json',
      }
    });
  } else {
    console.log('❌ Login failed:', data.message);
  }
})
.then(response => {
  if (response) {
    console.log('Dashboard response status:', response.status);
    return response.json();
  }
})
.then(data => {
  if (data) {
    console.log('✅ Dashboard data received:', data);
  }
})
.catch(error => {
  console.error('❌ Connection error:', error);
}); 