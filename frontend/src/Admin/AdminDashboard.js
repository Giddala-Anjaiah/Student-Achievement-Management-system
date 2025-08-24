import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { adminAPI } from '../api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: '',
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      console.log('Token from localStorage:', localStorage.getItem('token'));
      
      const [dashboardResponse, usersResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
      ]);
      
      console.log('Dashboard response:', JSON.stringify(dashboardResponse.data, null, 2));
      console.log('Users response:', JSON.stringify(usersResponse.data, null, 2));
      
      setDashboardData(dashboardResponse.data || {});
      // The backend returns { users, total, page, totalPages }
      setUsers(usersResponse.data?.users || []);
      setStats({}); // Set empty stats since the endpoint doesn't exist
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to fetch dashboard data.');
      // Set empty arrays/objects on error
      setUsers([]);
      setDashboardData({});
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await adminAPI.updateUserRole(selectedUser._id, editForm.role);
      setUsers((prevUsers) => (prevUsers || []).map(user =>
        user._id === selectedUser._id
          ? { ...user, ...editForm }
          : user
      ));
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Update user error:', err);
      setError('Failed to update user.');
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!addForm.name || !addForm.email || !addForm.password || !addForm.department) {
        setError('Please fill in all required fields (Name, Email, Password, Department).');
        return;
      }

      // Validate password length
      if (addForm.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      const response = await adminAPI.createUser(addForm);
      setUsers((prevUsers) => [response.data.user, ...(prevUsers || [])]);
      setAddDialogOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        department: '',
      });
      // Refresh dashboard data
      fetchDashboardData();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Add user error:', err);
      setError(err.response?.data?.message || 'Failed to add user.');
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      setUsers((prevUsers) => prevUsers.filter(user => user._id !== selectedUser._id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      // Refresh dashboard data
      fetchDashboardData();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImporting(true);
    try {
      const response = await adminAPI.importUsers(importFile);
      setImportResults(response.data);
      setImportFile(null);
      // Refresh users list
      fetchDashboardData();
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['text/csv', 'application/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
        setImportFile(file);
        console.log('Selected file:', file.name, 'Type:', file.type, 'Extension:', fileExtension);
      } else {
        alert('Please select a valid CSV or Excel file (.csv, .xls, .xlsx)');
        event.target.value = '';
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'faculty':
        return 'warning';
      case 'student':
        return 'primary';
      default:
        return 'default';
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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <PeopleIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {dashboardData.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <TrophyIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {dashboardData.totalAchievements || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <TrendingIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {dashboardData.pendingAchievements || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Pending Approvals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <NotificationIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {dashboardData.totalNotifications || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Notifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        {dashboardData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Recent Achievements
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {(dashboardData.recentAchievements || []).map((achievement, index) => (
                    <Box key={achievement._id} sx={{ mb: 2, pb: 2, borderBottom: index < (dashboardData.recentAchievements || []).length - 1 ? '1px solid #eee' : 'none' }}>
                      <Typography variant="subtitle2">
                        {achievement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.studentName} • {new Date(achievement.createdAt).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={achievement.status}
                        color={achievement.status === 'approved' ? 'success' : achievement.status === 'pending' ? 'warning' : 'error'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  System Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Students
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.userStats?.student || 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Faculty
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.userStats?.faculty || 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Admins
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.userStats?.admin || 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.totalAchievements - dashboardData.pendingAchievements || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* User Management */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              User Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add User
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import Users
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(users || []).map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        aria-label={`Edit user ${user.name}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                        aria-label={`Delete user ${user.name}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              id="edit-name"
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              id="edit-email"
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                id="edit-role"
                value={editForm.role}
                label="Role"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-department-label">Department</InputLabel>
              <Select
                labelId="edit-department-label"
                id="edit-department"
                value={editForm.department}
                label="Department"
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              >
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="AIML">AIML</MenuItem>
                <MenuItem value="CSM">CSM</MenuItem>
                <MenuItem value="CSO">CSO</MenuItem>
                <MenuItem value="CIC">CIC</MenuItem>
                <MenuItem value="EEE">EEE</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
                <MenuItem value="CIVIL">CIVIL</MenuItem>
                <MenuItem value="MECH">MECH</MenuItem>
                <MenuItem value="CAI">CAI</MenuItem>
                <MenuItem value="AI">AI</MenuItem>
                <MenuItem value="ML">ML</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              id="add-name"
              label="Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              id="add-email"
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              id="add-password"
              label="Password"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              margin="normal"
              required
              error={addForm.password.length > 0 && addForm.password.length < 6}
              helperText={addForm.password.length > 0 && addForm.password.length < 6 ? 'Password must be at least 6 characters' : ''}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="add-role-label">Role</InputLabel>
              <Select
                labelId="add-role-label"
                id="add-role"
                value={addForm.role}
                label="Role"
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              id="add-student-id"
              label="Student ID (optional)"
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="add-department-label">Department</InputLabel>
              <Select
                labelId="add-department-label"
                id="add-department"
                value={addForm.department}
                label="Department"
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              >
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="AIML">AIML</MenuItem>
                <MenuItem value="CSM">CSM</MenuItem>
                <MenuItem value="CSO">CSO</MenuItem>
                <MenuItem value="CIC">CIC</MenuItem>
                <MenuItem value="EEE">EEE</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
                <MenuItem value="CIVIL">CIVIL</MenuItem>
                <MenuItem value="MECH">MECH</MenuItem>
                <MenuItem value="CAI">CAI</MenuItem>
                <MenuItem value="AI">AI</MenuItem>
                <MenuItem value="ML">ML</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All user data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Users from CSV/Excel</DialogTitle>
        <DialogContent>
                     <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
             Upload a CSV or Excel file (.csv, .xls, .xlsx) with user data. The file should contain columns: name, email, password, role, department, studentId (optional), isActive (optional).
           </Typography>
          
          <input
            accept=".csv,.xls,.xlsx"
            style={{ display: 'none' }}
            id="import-file-input"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="import-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Select File
            </Button>
          </label>
          
          {importFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected file: {importFile.name}
            </Typography>
          )}

          {importResults && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary">
                Import Results
              </Typography>
              <Typography variant="body2">
                Successfully Imported: {importResults.successCount}
              </Typography>
              <Typography variant="body2">
                Errors: {importResults.errorCount}
              </Typography>
              <Typography variant="body2">
                Total Rows: {importResults.totalRows}
              </Typography>
              
              {importResults.errors && importResults.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color="error">
                    Errors:
                  </Typography>
                  {importResults.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                      {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImportUsers} 
            variant="contained" 
            disabled={!importFile || importing}
            startIcon={importing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {importing ? 'Importing...' : 'Import Users'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
