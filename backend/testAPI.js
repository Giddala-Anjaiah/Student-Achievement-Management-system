const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test admin dashboard endpoint
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
    console.log('Admin Dashboard Response:', response.data);
    
    // Test users endpoint
    const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`);
    console.log('Users Response:', usersResponse.data);
    
    console.log('✅ Backend API is working correctly!');
  } catch (error) {
    console.error('❌ Backend API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI(); 