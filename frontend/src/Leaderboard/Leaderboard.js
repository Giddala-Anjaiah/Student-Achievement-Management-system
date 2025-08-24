import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { leaderboardAPI } from '../api';

const Leaderboard = () => {
  const [topAchievers, setTopAchievers] = useState([]);
  const [categoryLeaders, setCategoryLeaders] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [topResponse, statsResponse] = await Promise.all([
        leaderboardAPI.getTopAchievers(),
        leaderboardAPI.getStats(),
      ]);
      
      setTopAchievers(topResponse.data);
      setStats(statsResponse.data);
      
      // Fetch category-specific leaders
      const categories = ['academic', 'extracurricular', 'cocurricular', 'sports', 'cultural', 'technical', 'leadership'];
      const categoryData = {};
      
      for (const category of categories) {
        try {
          const response = await leaderboardAPI.getByCategory(category);
          categoryData[category] = response.data.slice(0, 5); // Top 5 per category
        } catch (err) {
          console.error(`Failed to fetch ${category} leaders:`, err);
        }
      }
      
      setCategoryLeaders(categoryData);
    } catch (err) {
      setError('Failed to fetch leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <TrophyIcon sx={{ color: '#FFD700', fontSize: 32 }} />;
      case 2:
        return <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 28 }} />;
      case 3:
        return <TrophyIcon sx={{ color: '#CD7F32', fontSize: 24 }} />;
      default:
        return <StarIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
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
          Leaderboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {stats.totalAchievements || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {stats.totalStudents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrophyIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {stats.approvedAchievements || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Achievers */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Top Achievers
          </Typography>
          <List>
            {topAchievers.map((achiever, index) => (
              <React.Fragment key={achiever._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getMedalIcon(index + 1)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {achiever.studentName}
                        </Typography>
                        <Chip
                          label={`${achiever.achievementCount} achievements`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {achiever.department} • {achiever.studentId}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < topAchievers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Category Leaders */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Category Leaders
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
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
          </Box>

          <Grid container spacing={3}>
            {Object.entries(categoryLeaders).map(([category, leaders]) => {
              if (selectedCategory !== 'all' && selectedCategory !== category) return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={category.charAt(0).toUpperCase() + category.slice(1)}
                          color={getCategoryColor(category)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          Top {leaders.length}
                        </Typography>
                      </Box>
                      
                      <List dense>
                        {leaders.map((leader, index) => (
                          <ListItem key={leader._id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {index + 1}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={leader.studentName}
                              secondary={`${leader.achievementCount} achievements`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Leaderboard;
