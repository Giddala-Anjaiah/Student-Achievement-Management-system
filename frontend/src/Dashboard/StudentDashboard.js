import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Add as AddIcon,
  TrendingUp as LeaderboardIcon,
  Description as PortfolioIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { achievementsAPI } from '../api';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await achievementsAPI.getByUser(user._id);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'rejected':
        return <RejectedIcon />;
      default:
        return null;
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

  const approvedCount = achievements.filter(a => a.status === 'approved').length;
  const pendingCount = achievements.filter(a => a.status === 'pending').length;
  const rejectedCount = achievements.filter(a => a.status === 'rejected').length;

  const recentAchievements = achievements
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Welcome back, {user.name}! 🎉
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <TrophyIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {achievements.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <ApprovedIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {approvedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <PendingIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {pendingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <RejectedIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {rejectedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => navigate('/achievements/new')}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <AddIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Add Achievement
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Submit a new achievement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => navigate('/leaderboard')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <LeaderboardIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  View Leaderboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  See top achievers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => navigate('/portfolio')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <PortfolioIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  My Portfolio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your portfolio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => navigate('/notifications')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check updates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Achievements */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Recent Achievements
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/achievements')}
                size="small"
              >
                View All
              </Button>
            </Box>
            
            {recentAchievements.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No achievements yet. Start by adding your first achievement!
              </Typography>
            ) : (
              <List>
                {recentAchievements.map((achievement, index) => (
                  <React.Fragment key={achievement._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getCategoryColor(achievement.category) }}>
                          {getStatusIcon(achievement.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {achievement.title}
                            </Typography>
                            <Chip
                              label={achievement.status}
                              color={getStatusColor(achievement.status)}
                              size="small"
                            />
                            <Chip
                              label={achievement.category}
                              color={getCategoryColor(achievement.category)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {achievement.description.length > 100
                              ? `${achievement.description.substring(0, 100)}...`
                              : achievement.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentAchievements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StudentDashboard; 