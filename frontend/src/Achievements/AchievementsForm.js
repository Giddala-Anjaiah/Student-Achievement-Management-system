import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { achievementsAPI } from '../api';

const AchievementsForm = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    organization: '',
    level: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const achievementData = {
        ...formData,
        studentId: user._id,
        studentName: user.name,
      };

      // If file is selected, upload it first
      if (file) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        const uploadResponse = await achievementsAPI.uploadDocument(formDataFile);
        achievementData.documentUrl = uploadResponse.data.url;
      }

      await achievementsAPI.create(achievementData);
      setSuccess('Achievement submitted successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/achievements');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit achievement.');
    } finally {
      setLoading(false);
    }
  };

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
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Submit Achievement
          </Typography>
          
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Achievement Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    <MenuItem value="academic">Academic</MenuItem>
                    <MenuItem value="extracurricular">Extracurricular</MenuItem>
                    <MenuItem value="cocurricular">Co-curricular</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="cultural">Cultural</MenuItem>
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="leadership">Leadership</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization/Institution"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={formData.level}
                    label="Level"
                    onChange={handleChange}
                  >
                    <MenuItem value="university">University</MenuItem>
                    <MenuItem value="state">State</MenuItem>
                    <MenuItem value="national">National</MenuItem>
                    <MenuItem value="international">International</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Supporting Document (Optional)
                  </Typography>
                  <input
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outlined" component="span">
                      Choose File
                    </Button>
                  </label>
                  {file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {file.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ minHeight: 48 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Achievement'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/achievements')}
                sx={{ minHeight: 48 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AchievementsForm;