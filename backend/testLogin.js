const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    // Test admin login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@university.edu',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Token:', loginResponse.data.token);
    console.log('User:', loginResponse.data.user);
    
    // Test admin dashboard with token
    const token = loginResponse.data.token;
    const dashboardResponse = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Admin Dashboard Response:', dashboardResponse.data);
    
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testLogin(); 