import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { stockAPI, analysisAPI, newsAPI } from '../services/apiService';

// Component for popular stocks
const PopularStocks = ({ onSelectStock }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopularStocks = async () => {
      try {
        const response = await stockAPI.getPopularStocks();
        setStocks(response.data);
      } catch (err) {
        console.error('Error fetching popular stocks:', err);
        setError('Failed to load popular stocks');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularStocks();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <List>
      {stocks.map((stock) => (
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
                onClick={() => onSelectStock(stock.symbol)}
              >
                {stock.symbol}
              </Link>
            }
            secondary={stock.name}
          />
          <Button
            variant="outlined"
            size="small"
            component={RouterLink}
            to={`/analysis/stock/${stock.symbol}`}
            onClick={() => onSelectStock(stock.symbol)}
          >
            Analyze
          </Button>
        </ListItem>
      ))}
    </List>
  );
};

// Component for saved analyses
const SavedAnalyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedAnalyses = async () => {
      try {
        // Get all saved analyses
        const response = await analysisAPI.getSavedAnalyses();
        
        // Group by symbol and keep only the most recent note for each symbol
        const latestBySymbol = {};
        response.data.forEach(analysis => {
          const symbol = analysis.symbol;
          
          // If we haven't seen this symbol yet, or this note is more recent than what we have
          if (!latestBySymbol[symbol] || 
              new Date(analysis.timestamp) > new Date(latestBySymbol[symbol].timestamp)) {
            latestBySymbol[symbol] = analysis;
          }
        });
        
        // Convert the object back to an array
        const latestAnalyses = Object.values(latestBySymbol);
        
        setAnalyses(latestAnalyses);
      } catch (err) {
        console.error('Error fetching saved analyses:', err);
        setError('Failed to load saved analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedAnalyses();
  }, []);


  const handleDelete = async (id) => {
    try {
      await analysisAPI.deleteSavedAnalysis(id);
      // Remove the deleted analysis from state
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (analyses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Typography variant="body1" color="text.secondary">
          You don't have any saved analyses yet.
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {analyses.map((analysis) => (
        <ListItem
          key={analysis.id}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' }
          }}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(analysis.id)}>
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
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

// Component for market news
const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        // Use mock data for now
        // In a real app, we would call newsAPI.getMarketNews()
        
        // Mock news data
        const mockNews = [
          {
            id: 1,
            title: 'Markets Rally on Economic Data',
            source: 'Bloomberg',
            url: '#',
            publishedAt: new Date().toISOString(),
            summary: 'Major indices closed higher as economic data signaled positive growth.'
          },
          {
            id: 2,
            title: 'Fed Signals Interest Rate Decision',
            source: 'CNBC',
            url: '#',
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            summary: 'The Federal Reserve indicated its stance on future interest rate adjustments.'
          },
          {
            id: 3,
            title: 'Tech Stocks Lead Market Gains',
            source: 'Reuters',
            url: '#',
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            summary: 'Technology sector continues to outperform the broader market.'
          }
        ];
        
        setNews(mockNews);
      } catch (err) {
        console.error('Error fetching market news:', err);
        setError('Failed to load market news');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketNews();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <List>
      {news.map((item) => (
        <ListItem
          key={item.id}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' }
          }}
        >
          <ListItemText
            primary={
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                {item.title}
              </Link>
            }
            secondary={
              <React.Fragment>
                <Typography variant="body2" component="span">
                  {item.source} | {new Date(item.publishedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.summary}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      window.location.href = `/analysis/stock/${searchQuery.trim().toUpperCase()}`;
    }
  };
  
  const handleSearchClick = () => {
    if (searchQuery.trim() !== '') {
      window.location.href = `/analysis/stock/${searchQuery.trim().toUpperCase()}`;
    }
  };

  const handleSelectStock = (symbol) => {
    console.log('Selected stock:', symbol);
    // Navigation is handled by the RouterLink component
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome, {user?.name || 'Investor'}
            </Typography>
            <Typography variant="body1">
              Search for a stock to analyze or view your saved analyses.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end"
                        onClick={handleSearchClick}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Popular stocks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Popular Stocks
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <PopularStocks onSelectStock={handleSelectStock} />
          </Paper>
        </Grid>

        {/* Saved analyses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Your Saved Analyses
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <SavedAnalyses />
          </Paper>
        </Grid>

        {/* Market news */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Market News
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <MarketNews />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;