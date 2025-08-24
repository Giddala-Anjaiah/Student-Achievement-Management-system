import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { achievementsAPI, getDocumentUrl } from '../api';

const AchievementsList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'student') {
        response = await achievementsAPI.getByUser(user._id);
      } else {
        response = await achievementsAPI.getAll();
      }
      
      setAchievements(response.data);
    } catch (err) {
      setError('Failed to fetch achievements.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      extracurricular: 'secondary',
      cocurricular: 'info',
      sports: 'success',
      cultural: 'warning',
      technical: 'error',
      leadership: 'default',
    };
    return colors[category] || 'default';
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || achievement.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Achievements
          </Typography>
          {user.role === 'student' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/achievements/new')}
            >
              Add Achievement
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search achievements"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredAchievements.length} achievements
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No achievements found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredAchievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement._id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '70%' }}>
                        {achievement.title}
                      </Typography>
                      <Chip
                        label={achievement.status}
                        color={getStatusColor(achievement.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {achievement.description.length > 100
                        ? `${achievement.description.substring(0, 100)}...`
                        : achievement.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={achievement.category}
                        color={getCategoryColor(achievement.category)}
                        size="small"
                      />
                      {achievement.level && (
                        <Chip label={achievement.level} variant="outlined" size="small" />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                    </Typography>
                    
                    {achievement.organization && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Organization:</strong> {achievement.organization}
                      </Typography>
                    )}

                    {user.role !== 'student' && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Student:</strong> {achievement.studentName}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/achievements/${achievement._id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {user.role === 'student' && achievement.status === 'pending' && (
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/achievements/edit/${achievement._id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {achievement.documentUrl && (
                      <Button size="small" href={getDocumentUrl(achievement.documentUrl)} target="_blank">
                        View Document
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default AchievementsList;
