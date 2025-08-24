import React, { useState, useEffect, useContext } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { achievementsAPI, getDocumentUrl } from '../api';

const AchievementsValidation = () => {
  const { user } = useContext(AuthContext);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, [statusFilter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const response = await achievementsAPI.getAll();
      console.log('Achievements response:', response.data); // Debug log
      
      // The backend returns { achievements, total, page, totalPages }
      const allAchievements = response.data.achievements || response.data || [];
      const filtered = allAchievements.filter(achievement => 
        statusFilter === 'all' || achievement.status === statusFilter
      );
      setAchievements(filtered);
    } catch (err) {
      console.error('Fetch achievements error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch achievements.';
      setError(errorMessage);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (achievementId, status, reason = '') => {
    try {
      await achievementsAPI.validate(achievementId, status);
      setDialogOpen(false);
      setSelectedAchievement(null);
      setRejectionReason('');
      fetchAchievements();
    } catch (err) {
      setError('Failed to update achievement status.');
    }
  };

  const openRejectionDialog = (achievement) => {
    setSelectedAchievement(achievement);
    setDialogOpen(true);
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
        <Typography variant="h4" component="h1" gutterBottom>
          Achievement Validation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Status Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No achievements found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {achievements.map((achievement) => (
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

                    <Typography variant="caption" color="text.secondary" display="block">
                      <strong>Student:</strong> {achievement.studentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                    </Typography>
                    {achievement.organization && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Organization:</strong> {achievement.organization}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    {achievement.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleValidation(achievement._id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => openRejectionDialog(achievement)}
                        >
                          Reject
                        </Button>
                      </>
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

      {/* Rejection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Achievement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting "{selectedAchievement?.title}":
          </Typography>
          <TextareaAutosize
            minRows={3}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleValidation(selectedAchievement._id, 'rejected', rejectionReason)}
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AchievementsValidation;
