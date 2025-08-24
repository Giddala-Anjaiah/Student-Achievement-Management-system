import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  List as ListIcon,
  TrendingUp as LeaderboardIcon,
  Description as PortfolioIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as ImportIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  const getNavItems = () => {
    const items = [];

    if (user.role === 'student') {
      items.push(
        { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { label: 'Achievements', path: '/achievements', icon: <ListIcon /> },
        { label: 'Add Achievement', path: '/achievements/new', icon: <AddIcon /> },
        { label: 'Search', path: '/search', icon: <SearchIcon /> },
        { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
        { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon /> },
        { label: 'Portfolio', path: '/portfolio', icon: <PortfolioIcon /> },
        { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> }
      );
    } else if (user.role === 'faculty') {
      items.push(
        { label: 'Validate Achievements', path: '/achievements/validate', icon: <DashboardIcon /> },
        { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon /> },
        { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> }
      );
    } else if (user.role === 'admin') {
      items.push(
        { label: 'Admin Dashboard', path: '/admin', icon: <DashboardIcon /> },
        { label: 'Data Import', path: '/import', icon: <ImportIcon /> },
        { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon /> },
        { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TrophyIcon sx={{ mr: { xs: 1, sm: 2 }, fontSize: { xs: 24, sm: 28, md: 32 } }} />
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              display: { xs: 'none', sm: 'block' }
            }}>
              Student Achievements
            </Typography>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1,
              fontSize: '1rem',
              display: { xs: 'block', sm: 'none' }
            }}>
              Achievements
            </Typography>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            onClick={handleMobileMenuToggle}
            sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Navigation Items - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={user.role}
              color="secondary"
              size="small"
              sx={{ 
                textTransform: 'capitalize',
                display: { xs: 'none', sm: 'block' }
              }}
            />
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrophyIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h6">
              Student Achievements
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Chip
              label={user.role}
              color="secondary"
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
        
        <Divider />
        
        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => {
                navigate(item.path);
                handleMobileMenuClose();
              }}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{ 
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <List>
          <ListItem button onClick={() => { navigate('/profile'); handleMobileMenuClose(); }}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navigation; 