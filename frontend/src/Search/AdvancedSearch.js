import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Card,
  CardContent,
  Pagination,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { searchAPI } from '../api';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    level: '',
    status: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    studentName: '',
    organization: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterOptions, setFilterOptions] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (searchParams.query.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchParams.query]);

  const loadFilterOptions = async () => {
    try {
      const response = await searchAPI.getFilterOptions();
      setFilterOptions(response.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await searchAPI.getSuggestions(searchParams.query);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await searchAPI.searchAchievements(searchParams);
      setResults(response.data.achievements);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to perform search.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchParams({
      query: '',
      category: '',
      level: '',
      status: '',
      department: '',
      dateFrom: '',
      dateTo: '',
      studentName: '',
      organization: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    });
  };

  const handlePageChange = (event, newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value, page: 1 }));
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Search
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                freeSolo
                options={suggestions.map(s => ({ label: s.value, type: s.type }))}
                inputValue={searchParams.query}
                onInputChange={(event, newValue) => handleInputChange('query', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Search achievements, students, or organizations..."
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading && <CircularProgress size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={option.type} size="small" color="primary" />
                      {option.label}
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading}
                  fullWidth
                >
                  Search
                </Button>
                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={() => setShowFilters(!showFilters)}
                    color={showFilters ? 'primary' : 'default'}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Advanced Filters */}
        {showFilters && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Advanced Filters</Typography>
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear All
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={searchParams.category}
                    label="Category"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {filterOptions.categories?.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={searchParams.level}
                    label="Level"
                    onChange={(e) => handleInputChange('level', e.target.value)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    {filterOptions.levels?.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={searchParams.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={searchParams.department}
                    label="Department"
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {filterOptions.departments?.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={searchParams.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={searchParams.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date From"
                  type="date"
                  value={searchParams.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date To"
                  type="date"
                  value={searchParams.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={searchParams.sortBy}
                    label="Sort By"
                    onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="createdAt">Date Created</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="studentName">Student Name</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort Order</InputLabel>
                  <Select
                    value={searchParams.sortOrder}
                    label="Sort Order"
                    onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Search Results ({pagination.totalItems} achievements)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page {pagination.currentPage} of {pagination.totalPages}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {results.map((achievement) => (
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
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && searchParams.query && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No achievements found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default AdvancedSearch; 