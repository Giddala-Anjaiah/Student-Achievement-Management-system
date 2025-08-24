import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { achievementsAPI, getDocumentUrl } from '../api';

const AchievementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievement();
  }, [id]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      const response = await achievementsAPI.getById(id);
      setAchievement(response.data);
    } catch (err) {
      setError('Failed to fetch achievement details.');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !achievement) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Achievement not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
            Achievement Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              {/* Title and Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  {achievement.title}
                </Typography>
                <Chip
                  label={achievement.status}
                  color={getStatusColor(achievement.status)}
                  size="large"
                />
              </Box>

              {/* Description */}
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {achievement.description}
              </Typography>

              {/* Tags */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={achievement.category}
                  color={getCategoryColor(achievement.category)}
                  size="medium"
                />
                {achievement.level && (
                  <Chip
                    icon={<TrophyIcon />}
                    label={achievement.level}
                    variant="outlined"
                    size="medium"
                  />
                )}
              </Box>

              {/* Details Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                {achievement.organization && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Organization:</strong> {achievement.organization}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Student:</strong> {achievement.studentName}
                    </Typography>
                  </Box>
                </Grid>
                {achievement.points && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrophyIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Points:</strong> {achievement.points}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Document */}
              {achievement.documentUrl && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Supporting Document
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    href={getDocumentUrl(achievement.documentUrl)}
                    target="_blank"
                  >
                    View Document
                  </Button>
                </Box>
              )}

              {/* Validation Info */}
              {achievement.validatedBy && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Validation Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Validated By:</strong> {achievement.validatedBy.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Validated On:</strong> {new Date(achievement.validatedAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Rejection Reason */}
              {achievement.rejectionReason && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom color="error">
                    Rejection Reason
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="body2">
                      {achievement.rejectionReason}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Achievement Info
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {new Date(achievement.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Last Updated:</strong> {new Date(achievement.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {achievement.status === 'pending' && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      fullWidth
                      onClick={() => navigate(`/achievements/edit/${achievement._id}`)}
                    >
                      Edit Achievement
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AchievementDetail; 