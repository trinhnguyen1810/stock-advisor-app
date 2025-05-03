import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
  Card,
  CardContent,
  Link,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { analysisAPI } from '../services/apiService';

const SectorAnalysis = () => {
  const { sector } = useParams();
  const [sectorData, setSectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSectorData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await analysisAPI.getSectorAnalysis(sector);
        setSectorData(response.data);
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError('Failed to load sector data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (sector) {
      fetchSectorData();
    }
  }, [sector]);

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

  if (!sectorData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          No data available for {sector} sector.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          {sectorData.sector} Sector Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ETF: {sectorData.etf}
        </Typography>
        <Chip 
          label={sectorData.relativePerformance > 0 ? "Outperforming Market" : "Underperforming Market"} 
          color={sectorData.relativePerformance > 0 ? "success" : "error"} 
          sx={{ mt: 1 }}
        />
      </Paper>
      
      {/* Performance Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Sector Performance
                </Typography>
                <Typography variant="h4" sx={{ color: sectorData.performance > 0 ? 'success.main' : 'error.main' }}>
                  {sectorData.performance > 0 ? '+' : ''}{sectorData.performance}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Market Performance
                </Typography>
                <Typography variant="h4" sx={{ color: sectorData.marketPerformance > 0 ? 'success.main' : 'error.main' }}>
                  {sectorData.marketPerformance > 0 ? '+' : ''}{sectorData.marketPerformance}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Relative Performance
                </Typography>
                <Typography variant="h4" sx={{ color: sectorData.relativePerformance > 0 ? 'success.main' : 'error.main' }}>
                  {sectorData.relativePerformance > 0 ? '+' : ''}{sectorData.relativePerformance}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Volatility
                </Typography>
                <Typography variant="h4">
                  {sectorData.volatility}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Outlook
          </Typography>
          <Typography variant="body1">
            {sectorData.outlook}
          </Typography>
        </Box>
      </Paper>
      
      {/* Top Stocks */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Stocks in {sectorData.sector}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {sectorData.topStocks.map((stock) => (
            <ListItem
              key={stock.symbol}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <ListItemText
                primary={
                  <Link
                    component={RouterLink}
                    to={`/analysis/stock/${stock.symbol}`}
                    color="inherit"
                    underline="hover"
                  >
                    {stock.symbol} - {stock.name}
                  </Link>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span">
                      Performance: {stock.performance > 0 ? '+' : ''}{stock.performance}%
                    </Typography>
                    <Chip
                      size="small"
                      label={stock.recommendation}
                      color={
                        stock.recommendation === 'BUY' 
                          ? 'success' 
                          : stock.recommendation === 'SELL' 
                            ? 'error' 
                            : 'warning'
                      }
                      sx={{ ml: 1 }}
                    />
                  </React.Fragment>
                }
              />
              <Button
                variant="outlined"
                size="small"
                component={RouterLink}
                to={`/analysis/stock/${stock.symbol}`}
              >
                Analyze
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default SectorAnalysis;