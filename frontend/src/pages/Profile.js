import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
  Chip,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI, analysisAPI } from '../services/apiService';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  // Fetch user data and saved analyses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch user profile
        const profileResponse = await authAPI.getCurrentUser();
        setUserProfile(profileResponse.data);
        setFormData({
          name: profileResponse.data.name,
          email: profileResponse.data.email
        });
        
        // Fetch saved analyses
        const analysesResponse = await analysisAPI.getSavedAnalyses();
        setSavedAnalyses(analysesResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteAnalysis = async (id) => {
    try {
      await analysisAPI.deleteSavedAnalysis(id);
      // Remove the deleted analysis from state
      setSavedAnalyses(savedAnalyses.filter(analysis => analysis.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Failed to delete analysis');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    // In a real app, you'd update the user profile with an API call
    // For this demo, we'll just update the local state
    setUserProfile({
      ...userProfile,
      name: formData.name,
      email: formData.email
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* User Profile */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h1" variant="h4">
            Profile
          </Typography>
          
          {!editMode ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: userProfile.name,
                    email: userProfile.email
                  });
                }}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Save
              </Button>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {editMode ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                type="email"
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Name
              </Typography>
              <Typography variant="h6">
                {userProfile?.name || user?.name || 'User'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Email
              </Typography>
              <Typography variant="h6">
                {userProfile?.email || user?.email || 'user@example.com'}
              </Typography>
            </Grid>
          </Grid>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
      
      {/* Saved Analyses */}
      <Paper sx={{ p: 3 }}>
        <Typography component="h2" variant="h5" gutterBottom>
          Saved Analyses
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {savedAnalyses.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="body1" color="text.secondary">
              You don't have any saved analyses yet.
            </Typography>
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Start Analyzing Stocks
            </Button>
          </Box>
        ) : (
          <List>
            {savedAnalyses.map((analysis) => (
              <ListItem
                key={analysis.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAnalysis(analysis.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Link
                      component={RouterLink}
                      to={`/analysis/stock/${analysis.symbol}`}
                      color="inherit"
                      underline="hover"
                    >
                      {analysis.symbol} - {analysis.name}
                    </Link>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span">
                        {new Date(analysis.timestamp).toLocaleDateString()} | 
                      </Typography>
                      <Chip
                        size="small"
                        label={analysis.recommendation}
                        color={
                          analysis.recommendation === 'BUY' 
                            ? 'success' 
                            : analysis.recommendation === 'SELL' 
                              ? 'error' 
                              : 'warning'
                        }
                        sx={{ ml: 1 }}
                      />
                      {analysis.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Notes: {analysis.notes}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;