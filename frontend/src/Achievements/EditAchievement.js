import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { achievementsAPI } from '../api';

const EditAchievement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    date: '',
    organization: '',
  });

  useEffect(() => {
    fetchAchievement();
  }, [id]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      const response = await achievementsAPI.getById(id);
      const achievement = response.data;
      
      setFormData({
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        level: achievement.level,
        date: achievement.date.split('T')[0], // Format date for input
        organization: achievement.organization || '',
      });
    } catch (err) {
      setError('Failed to fetch achievement details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await achievementsAPI.update(id, formData);
      setSuccess('Achievement updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/achievements');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update achievement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/achievements')}
            sx={{ mr: 2 }}
          >
            Back to Achievements
          </Button>
          <Typography variant="h4" component="h1">
            Edit Achievement
          </Typography>
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

        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Achievement Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>

              {/* Category and Level */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
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
                <FormControl fullWidth>
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

              {/* Date and Organization */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/achievements')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditAchievement; 