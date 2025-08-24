import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Notifications as NotificationIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { notificationsAPI } from '../api';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement_approved':
        return <ApprovedIcon color="success" />;
      case 'achievement_rejected':
        return <RejectedIcon color="error" />;
      default:
        return <NotificationIcon color="primary" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement_approved':
        return 'success';
      case 'achievement_rejected':
        return 'error';
      default:
        return 'primary';
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
        <Typography variant="h4" component="h1" gutterBottom>
          Notifications
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!notification.read && (
                          <Chip
                            label="New"
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => deleteNotification(notification._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'bold',
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            color={getNotificationColor(notification.type)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      onClick={() => !notification.read && markAsRead(notification._id)}
                      sx={{ cursor: notification.read ? 'default' : 'pointer' }}
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Notifications;
