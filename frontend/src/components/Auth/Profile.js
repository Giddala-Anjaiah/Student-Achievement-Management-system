import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { AuthContext } from '../../context/AuthContext';
import { authAPI } from '../../api';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Reset password states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        studentId: user.studentId || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(formData);
      login(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    // Validate passwords
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetError('New passwords do not match');
      setResetLoading(false);
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long');
      setResetLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        currentPassword: resetPasswordData.currentPassword,
        newPassword: resetPasswordData.newPassword,
      });
      setResetSuccess('Password updated successfully!');
      setResetPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetSuccess('');
      }, 2000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({
      ...resetPasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const openResetDialog = () => {
    setResetDialogOpen(true);
    setResetError('');
    setResetSuccess('');
    setResetPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="profile-department-label">Department</InputLabel>
                  <Select
                    labelId="profile-department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    label="Department"
                    onChange={handleChange}
                  >
                    <MenuItem value="CSE">CSE</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="AIML">AIML</MenuItem>
                    <MenuItem value="CSM">CSM</MenuItem>
                    <MenuItem value="CSO">CSO</MenuItem>
                    <MenuItem value="CIC">CIC</MenuItem>
                    <MenuItem value="EEE">EEE</MenuItem>
                    <MenuItem value="ECE">ECE</MenuItem>
                    <MenuItem value="CIVIL">CIVIL</MenuItem>
                    <MenuItem value="MECH">MECH</MenuItem>
                    <MenuItem value="CAI">CAI</MenuItem>
                    <MenuItem value="AI">AI</MenuItem>
                    <MenuItem value="ML">ML</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {user.role === 'student' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Account Information</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={openResetDialog}
                >
                  Reset Password
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>User ID:</strong> {user._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Role:</strong> {user.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}
          {resetSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetSuccess}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={resetPasswordData.currentPassword}
              onChange={handleResetPasswordChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={resetPasswordData.newPassword}
              onChange={handleResetPasswordChange}
              margin="normal"
              required
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={handleResetPasswordChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} disabled={resetLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            disabled={resetLoading}
            startIcon={resetLoading ? <CircularProgress size={20} /> : <LockIcon />}
          >
            {resetLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
