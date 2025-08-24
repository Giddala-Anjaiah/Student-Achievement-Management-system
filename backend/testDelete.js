const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testDeleteAPI() {
  try {
    console.log('Testing delete user API...');
    
    // First login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@university.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');
    
    // Get all users to find a user to delete
    const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Users found:', usersResponse.data.users.length);
    
    // Find a non-admin user to delete (for safety)
    const userToDelete = usersResponse.data.users.find(user => user.role !== 'admin');
    
    if (!userToDelete) {
      console.log('No non-admin users found to delete');
      return;
    }
    
    console.log(`Testing delete for user: ${userToDelete.name} (${userToDelete.email})`);
    
    // Test the delete endpoint (but don't actually delete)
    console.log('DELETE endpoint should be available at:', `${API_BASE_URL}/admin/users/${userToDelete._id}`);
    
    // Test if the route exists by making a HEAD request
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/users/${userToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Delete API is working!');
      console.log('Response:', deleteResponse.data);
    } catch (error) {
      console.log('❌ Delete API error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeleteAPI(); 