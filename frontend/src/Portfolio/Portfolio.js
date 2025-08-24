import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { portfolioAPI, achievementsAPI } from '../api';

const Portfolio = () => {
  const { user } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const [portfolioResponse, achievementsResponse] = await Promise.all([
        portfolioAPI.generate(user._id),
        achievementsAPI.getByUser(user._id),
      ]);
      
      setPortfolio(portfolioResponse.data);
      setAchievements(achievementsResponse.data);
    } catch (err) {
      setError('Failed to fetch portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await portfolioAPI.exportPDF(user._id);
      // Create a download link for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name}_Portfolio.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Portfolio`,
        text: `Check out ${user.name}'s achievements portfolio!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Portfolio link copied to clipboard!');
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

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Portfolio Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem' }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" component="h1" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user.studentId} • {user.department}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip
                  icon={<TrophyIcon />}
                  label={`${achievements.length} Achievements`}
                  color="primary"
                />
                <Chip
                  label={`${achievements.filter(a => a.status === 'approved').length} Approved`}
                  color="success"
                />
                <Chip
                  label={`${achievements.filter(a => a.status === 'pending').length} Pending`}
                  color="warning"
                />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportPDF}
                  fullWidth
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  fullWidth
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  fullWidth
                >
                  Share
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Portfolio Stats */}
        {portfolio && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" component="div" color="primary">
                    {portfolio.totalAchievements}
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
                  <Typography variant="h4" component="div" color="success.main">
                    {portfolio.approvedAchievements}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Achievements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" component="div" color="secondary.main">
                    {portfolio.categoriesCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categories Covered
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Achievements by Category */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Achievements by Category
          </Typography>
          
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="All" />
            {Object.keys(groupedAchievements).map((category) => (
              <Tab
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
              />
            ))}
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          {selectedTab === 0 ? (
            // Show all achievements
            <Grid container spacing={3}>
              {achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement._id}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" noWrap sx={{ maxWidth: '70%' }}>
                          {achievement.title}
                        </Typography>
                        <Chip
                          label={achievement.status}
                          color={getStatusColor(achievement.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.description}
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
                        <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                      </Typography>
                      {achievement.organization && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Organization:</strong> {achievement.organization}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Show achievements by selected category
            <Grid container spacing={3}>
              {groupedAchievements[Object.keys(groupedAchievements)[selectedTab - 1]]?.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement._id}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" noWrap sx={{ maxWidth: '70%' }}>
                          {achievement.title}
                        </Typography>
                        <Chip
                          label={achievement.status}
                          color={getStatusColor(achievement.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {achievement.level && (
                          <Chip label={achievement.level} variant="outlined" size="small" />
                        )}
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}
                      </Typography>
                      {achievement.organization && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Organization:</strong> {achievement.organization}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Portfolio;
