import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  const features = [
    {
      title: 'Causal Analysis',
      description: 'Identify key factors driving stock price changes with our advanced causal analysis engine.',
      icon: <ShowChartIcon sx={{ fontSize: 50 }} color="primary" />,
    },
    {
      title: 'Investment Recommendations',
      description: 'Receive clear buy/hold/sell recommendations backed by detailed reasoning and data.',
      icon: <TrendingUpIcon sx={{ fontSize: 50 }} color="primary" />,
    },
    {
      title: 'News Integration',
      description: 'Automatically collect and analyze relevant financial news to understand market sentiment.',
      icon: <AssessmentIcon sx={{ fontSize: 50 }} color="primary" />,
    },
    {
      title: 'Sector Analysis',
      description: 'Analyze entire sectors and industries to identify broader market trends and opportunities.',
      icon: <AccountBalanceIcon sx={{ fontSize: 50 }} color="primary" />,
    },
  ];

  return (
    <Box>
      {/* Hero section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?finance)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', py: 6 }}>
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            Stock Trend Causality + AI Investment Advisor
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Make data-driven investment decisions by understanding the factors affecting stock trends
          </Typography>
          <Box sx={{ mt: 4 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/dashboard"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Features section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Key Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    {feature.title}
                  </Typography>
                  <Typography align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Call to action */}
      <Box sx={{ bgcolor: 'primary.light', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Ready to make smarter investment decisions?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join today and gain access to our AI-powered investment tools and analysis.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/dashboard"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              >
                Sign Up Now
              </Button>
            )}
          </Box>
        </Container>
      </Box>
      
      {/* How it works */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          How It Works
        </Typography>
        
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                1. Search for a stock
              </Typography>
              <Typography paragraph>
                Enter any stock symbol or company name to begin your analysis.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                2. Review causal factors
              </Typography>
              <Typography paragraph>
                Our AI identifies key factors driving the stock's performance, from market trends to company-specific events.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                3. Get AI recommendations
              </Typography>
              <Typography paragraph>
                Receive clear investment recommendations with confidence levels and detailed reasoning to support your decisions.
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                4. Save and track analyses
              </Typography>
              <Typography paragraph>
                Save analyses to track performance over time and build your investment strategy.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                boxShadow: 3
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Example Analysis: AAPL
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Key Factors:</strong>
              </Typography>
              <ul>
                <li><Typography variant="body2">Earnings Report: Strong impact (0.8)</Typography></li>
                <li><Typography variant="body2">Market Trend: Moderate impact (0.4)</Typography></li>
                <li><Typography variant="body2">Sector Performance: Moderate impact (0.3)</Typography></li>
                <li><Typography variant="body2">Analyst Ratings: Strong impact (0.6)</Typography></li>
              </ul>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Recommendation:</strong> BUY
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Confidence:</strong> 85%
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Reasoning:</strong> Based on strong quarterly earnings, positive analyst ratings, and favorable market conditions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;