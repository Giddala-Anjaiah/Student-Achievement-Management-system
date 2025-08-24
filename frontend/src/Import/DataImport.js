import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  Edit as EditIcon,
  CheckCircle as ValidIcon,
  Error as InvalidIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { importAPI } from '../api';

const DataImport = () => {
  const [activeTab, setActiveTab] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // CSV Import
  const [csvFile, setCsvFile] = useState(null);

  // Manual Import
  const [manualAchievements, setManualAchievements] = useState([
    {
      title: '',
      description: '',
      category: '',
      level: 'university',
      date: new Date().toISOString().split('T')[0],
      organization: '',
      studentEmail: '',
      studentName: '',
      department: 'Computer Science',
      status: 'pending',
      points: 0
    }
  ]);

  // Email validation state
  const [emailValidation, setEmailValidation] = useState({});

  useEffect(() => {
    fetchImportStats();
  }, []);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Update email validation when manual achievements change
  useEffect(() => {
    const validation = {};
    manualAchievements.forEach((achievement, index) => {
      if (achievement.studentEmail) {
        validation[index] = validateEmail(achievement.studentEmail);
      }
    });
    setEmailValidation(validation);
  }, [manualAchievements]);

  const fetchImportStats = async () => {
    try {
      const response = await importAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch import stats:', err);
    }
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      
      if (isCSV || isExcel) {
        setCsvFile(file);
        setError('');
      } else {
        setError('Please select a valid CSV or Excel file (.csv, .xls, .xlsx).');
      }
    } else {
      setError('Please select a file.');
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setError('Please select a CSV file to import.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await importAPI.importFromCSV(formData);
      setImportResult(response.data);
      
      if (response.data.successCount > 0) {
        setSuccess(`Import completed! ${response.data.successCount} achievements imported successfully.`);
      } else {
        setError(`Import completed but no achievements were imported. Check the errors below.`);
      }
      setCsvFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';

      // Refresh stats
      fetchImportStats();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to import file.';
      const errorDetails = err.response?.data?.error || '';
      setError(`${errorMessage} ${errorDetails ? `Details: ${errorDetails}` : ''}`);
      console.error('Import error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAchievementChange = (index, field, value) => {
    const updatedAchievements = [...manualAchievements];
    updatedAchievements[index][field] = value;
    setManualAchievements(updatedAchievements);
  };

  const addManualAchievement = () => {
    setManualAchievements([
      ...manualAchievements,
      {
        title: '',
        description: '',
        category: '',
        level: 'university',
        date: new Date().toISOString().split('T')[0],
        organization: '',
        studentEmail: '',
        studentName: '',
        department: 'Computer Science',
        status: 'pending',
        points: 0
      }
    ]);
  };

  const removeManualAchievement = (index) => {
    if (manualAchievements.length > 1) {
      const updatedAchievements = manualAchievements.filter((_, i) => i !== index);
      setManualAchievements(updatedAchievements);
    }
  };

  const handleManualImport = async () => {
    // Validate all achievements
    const validAchievements = manualAchievements.filter(achievement => 
      achievement.title && 
      achievement.description && 
      achievement.category && 
      achievement.studentEmail &&
      validateEmail(achievement.studentEmail)
    );

    if (validAchievements.length === 0) {
      setError('Please fill in at least one achievement with all required fields and valid email addresses.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await importAPI.importManually({ achievements: validAchievements });
      setImportResult(response.data);
      setSuccess(`Manual import completed! ${response.data.successCount} achievements imported successfully.`);
      
      // Reset form
      setManualAchievements([{
        title: '',
        description: '',
        category: '',
        level: 'university',
        date: new Date().toISOString().split('T')[0],
        organization: '',
        studentEmail: '',
        studentName: '',
        department: 'Computer Science',
        status: 'pending',
        points: 0
      }]);

      // Refresh stats
      fetchImportStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import achievements.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await importAPI.getTemplate();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'achievements_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download template.');
    }
  };



  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Data Import
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ 
          mb: 3,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Import achievements data from CSV files or add them manually. Supports any email domain (gmail.com, vvit.net, etc.).
        </Typography>

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

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Import Methods */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item>
                    <Button
                      variant={activeTab === 'csv' ? 'contained' : 'outlined'}
                      startIcon={<FileUploadIcon />}
                      onClick={() => setActiveTab('csv')}
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      CSV Import
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant={activeTab === 'manual' ? 'contained' : 'outlined'}
                      startIcon={<EditIcon />}
                      onClick={() => setActiveTab('manual')}
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Manual Entry
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* CSV Import Tab */}
              {activeTab === 'csv' && (
                <Box>
                                      <Typography variant="h6" gutterBottom>
                      Import from CSV or Excel File
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload a CSV or Excel file (.csv, .xls, .xlsx) with achievement data. Supports any email domain (gmail.com, vvit.net, yahoo.com, etc.).
                    </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadTemplate}
                      sx={{ mr: 2 }}
                    >
                      Download Template
                    </Button>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, .xlsx"
                      onChange={handleCsvFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="csv-file-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{ mr: 2 }}
                      >
                        Choose File (CSV/Excel)
                      </Button>
                    </label>
                    {csvFile && (
                      <Typography variant="body2" color="primary">
                        Selected: {csvFile.name}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleCsvImport}
                    disabled={!csvFile || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                  >
                    {loading ? 'Importing...' : 'Import File'}
                  </Button>
                </Box>
              )}

              {/* Manual Import Tab */}
              {activeTab === 'manual' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Manual Achievement Entry
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add achievements manually by filling out the form below. Supports any email domain.
                  </Typography>

                  {manualAchievements.map((achievement, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            Achievement {index + 1}
                          </Typography>
                          {manualAchievements.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() => removeManualAchievement(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Title *"
                              value={achievement.title}
                              onChange={(e) => handleManualAchievementChange(index, 'title', e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description *"
                              value={achievement.description}
                              onChange={(e) => handleManualAchievementChange(index, 'description', e.target.value)}
                              multiline
                              rows={2}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                              <InputLabel>Category *</InputLabel>
                              <Select
                                value={achievement.category}
                                label="Category *"
                                onChange={(e) => handleManualAchievementChange(index, 'category', e.target.value)}
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
                                value={achievement.level}
                                label="Level"
                                onChange={(e) => handleManualAchievementChange(index, 'level', e.target.value)}
                              >
                                <MenuItem value="university">University</MenuItem>
                                <MenuItem value="state">State</MenuItem>
                                <MenuItem value="national">National</MenuItem>
                                <MenuItem value="international">International</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Date"
                              type="date"
                              value={achievement.date}
                              onChange={(e) => handleManualAchievementChange(index, 'date', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Organization"
                              value={achievement.organization}
                              onChange={(e) => handleManualAchievementChange(index, 'organization', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Student Email *"
                              type="email"
                              value={achievement.studentEmail}
                              onChange={(e) => handleManualAchievementChange(index, 'studentEmail', e.target.value)}
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: emailValidation[index] ? 'primary.main' : 'error.main',
                                  },
                                },
                                '& .MuiInputBase-input': {
                                  color: emailValidation[index] ? 'primary.main' : 'inherit',
                                },
                              }}
                              InputProps={{
                                endAdornment: achievement.studentEmail && (
                                  emailValidation[index] ? (
                                    <ValidIcon color="primary" />
                                  ) : (
                                    <InvalidIcon color="error" />
                                  )
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Student Name"
                              value={achievement.studentName}
                              onChange={(e) => handleManualAchievementChange(index, 'studentName', e.target.value)}
                              placeholder="Auto-generated if empty"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Department</InputLabel>
                              <Select
                                value={achievement.department}
                                label="Department"
                                onChange={(e) => handleManualAchievementChange(index, 'department', e.target.value)}
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
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Points"
                              type="number"
                              value={achievement.points}
                              onChange={(e) => handleManualAchievementChange(index, 'points', parseInt(e.target.value) || 0)}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addManualAchievement}
                      sx={{ mr: 2 }}
                    >
                      Add Another Achievement
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleManualImport}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                    >
                      {loading ? 'Importing...' : 'Import Achievements'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Statistics Sidebar */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Import Statistics
                </Typography>
                
                {stats ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Achievements
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.totalAchievements}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip label={`${stats.pendingAchievements} Pending`} color="warning" size="small" />
                        <Chip label={`${stats.approvedAchievements} Approved`} color="success" size="small" />
                        <Chip label={`${stats.rejectedAchievements} Rejected`} color="error" size="small" />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Recent Imports
                    </Typography>
                    {stats.recentImports && stats.recentImports.length > 0 ? (
                      <Box>
                        {stats.recentImports.slice(0, 5).map((achievement, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2" noWrap>
                              {achievement.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achievement.studentId?.name} • {new Date(achievement.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent imports
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <CircularProgress size={20} />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Import Results */}
        {importResult && (
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {importResult.successCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successfully Imported
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {importResult.errorCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Errors
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {importResult.totalRows || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rows
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {importResult.processedRows || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processed Rows
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {importResult.errors && importResult.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Errors
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {importResult.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error" sx={{ mb: 0.5 }}>
                      {error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default DataImport; 