import React, { useState, useEffect } from 'react';
import StockNotes from '../components/analysis/StockNotes';
import { useParams } from 'react-router-dom';
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
  Chip,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Snackbar
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { stockAPI, analysisAPI } from '../services/apiService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Component to display stock chart
const StockChart = ({ data, symbol }) => {
  if (!data || !data.prices || data.prices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No price data available
        </Typography>
      </Box>
    );
  }

  // Format data for Chart.js
  const chartData = {
    labels: data.prices.map(item => item.date),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.prices.map(item => item.close),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${symbol} Price History`,
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// Component to display causal analysis
const CausalAnalysis = ({ data, isLoading, error }) => {
  if (isLoading) {
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

  if (!data || !data.factors || data.factors.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No causal analysis available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Key Factors Affecting {data.symbol}
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {data.factors.map((factor, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {factor.name}
                  </Typography>
                  <Chip 
                    label={`Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact}`} 
                    color={factor.impact > 0.5 ? 'success' : factor.impact < -0.2 ? 'error' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">
                  {factor.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="h6" gutterBottom>
        Sentiment Analysis
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              News Sentiment
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={data.sentiment.news > 0.6 ? 'success.main' : data.sentiment.news < 0.4 ? 'error.main' : 'warning.main'}>
              {(data.sentiment.news * 100).toFixed(0)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Social Sentiment
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={data.sentiment.social > 0.6 ? 'success.main' : data.sentiment.social < 0.4 ? 'error.main' : 'warning.main'}>
              {(data.sentiment.social * 100).toFixed(0)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Overall Sentiment
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={data.sentiment.overall > 0.6 ? 'success.main' : data.sentiment.overall < 0.4 ? 'error.main' : 'warning.main'}>
              {(data.sentiment.overall * 100).toFixed(0)}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Component to display investment recommendation
const InvestmentRecommendation = ({ data, isLoading, error }) => {
  if (isLoading) {
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

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No recommendation available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: data.recommendation === 'BUY' ? 'success.light' : data.recommendation === 'SELL' ? 'error.light' : 'warning.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {data.recommendation === 'BUY' ? (
            <TrendingUpIcon fontSize="large" sx={{ color: 'success.dark', mr: 2 }} />
          ) : data.recommendation === 'SELL' ? (
            <TrendingDownIcon fontSize="large" sx={{ color: 'error.dark', mr: 2 }} />
          ) : (
            <TimelineIcon fontSize="large" sx={{ color: 'warning.dark', mr: 2 }} />
          )}
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {data.recommendation}
            </Typography>
            <Typography variant="subtitle1">
              Confidence: {(data.confidence * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" paragraph>
          <strong>Reasoning:</strong> {data.reasoning}
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Time Horizon:</strong> {data.timeHorizon}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Price Targets
        </Typography>
        
        <Grid container spacing={2} sx={{ my: 1 }}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Low
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${data.priceTarget.low}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
              <Typography variant="subtitle2" color="white">
                Median
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="white">
                ${data.priceTarget.median}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                High
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${data.priceTarget.high}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Component to display news
const StockNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // In a real app, we would call an API
        // For now, we'll use mock data
        
        // Mock news data
        const mockNews = [
          {
            id: 1,
            title: `Latest Earnings Report for ${symbol}`,
            source: 'Bloomberg',
            url: '#',
            publishedAt: new Date().toISOString(),
            summary: `${symbol} reported quarterly earnings that exceeded analyst expectations.`
          },
          {
            id: 2,
            title: `Analyst Upgrades ${symbol} Stock`,
            source: 'CNBC',
            url: '#',
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            summary: `Major investment firm has upgraded ${symbol} stock to a "Buy" rating.`
          },
          {
            id: 3,
            title: `${symbol} Announces New Product Launch`,
            source: 'Reuters',
            url: '#',
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            summary: `${symbol} unveiled its latest product lineup at the annual conference.`
          }
        ];
        
        setNews(mockNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

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

  if (news.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No news available for {symbol}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {news.map((item) => (
        <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {item.title}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {item.source} | {new Date(item.publishedAt).toLocaleDateString()}
          </Typography>
          
          <Typography variant="body2" paragraph>
            {item.summary}
          </Typography>
          
          <Button variant="text" size="small" href={item.url} target="_blank" rel="noopener noreferrer">
            Read More
          </Button>
        </Paper>
      ))}
    </Box>
  );
};

const StockAnalysis = () => {
  const { symbol } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [stockData, setStockData] = useState(null);
  const [causalData, setCausalData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState({
    stock: true,
    causal: true,
    recommendation: true
  });
  const [error, setError] = useState({
    stock: '',
    causal: '',
    recommendation: ''
  });
  const [timeframe, setTimeframe] = useState('1mo');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      // Reset states
      setStockData(null);
      setCausalData(null);
      setRecommendationData(null);
      setLoading({
        stock: true,
        causal: true,
        recommendation: true
      });
      setError({
        stock: '',
        causal: '',
        recommendation: ''
      });

      // Fetch stock data
      try {
        const stockResponse = await stockAPI.getStockData(symbol, timeframe);
        setStockData(stockResponse.data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(prev => ({
          ...prev,
          stock: 'Failed to load stock data'
        }));
      } finally {
        setLoading(prev => ({
          ...prev,stock: false
        }));
      }

      // Fetch causal analysis
      try {
        const causalResponse = await analysisAPI.getCausalAnalysis(symbol);
        setCausalData(causalResponse.data);
      } catch (err) {
        console.error('Error fetching causal analysis:', err);
        setError(prev => ({
          ...prev,
          causal: 'Failed to load causal analysis'
        }));
      } finally {
        setLoading(prev => ({
          ...prev,
          causal: false
        }));
      }

      // Fetch recommendation
      try {
        const recommendationResponse = await analysisAPI.getRecommendation(symbol);
        setRecommendationData(recommendationResponse.data);
      } catch (err) {
        console.error('Error fetching recommendation:', err);
        setError(prev => ({
          ...prev,
          recommendation: 'Failed to load recommendation'
        }));
      } finally {
        setLoading(prev => ({
          ...prev,
          recommendation: false
        }));
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, timeframe]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleSaveAnalysis = async () => {
    if (!recommendationData) return;

    try {
      const analysisToSave = {
        symbol,
        name: stockData?.name || symbol,
        recommendation: recommendationData.recommendation,
        notes: notes
      };

      await analysisAPI.saveAnalysis(analysisToSave);

      setSnackbar({
        open: true,
        message: 'Analysis saved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving analysis:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save analysis',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const timeframeButtons = [
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: 'max', label: 'Max' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography component="h1" variant="h4">
              {symbol}
            </Typography>
            {stockData && (
              <Typography variant="subtitle1" color="text.secondary">
                {stockData.name}
              </Typography>
            )}
            {stockData && stockData.sector && (
              <Chip 
                label={stockData.sector} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
          
          {recommendationData && (
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={recommendationData.recommendation}
                color={
                  recommendationData.recommendation === 'BUY' 
                    ? 'success' 
                    : recommendationData.recommendation === 'SELL' 
                      ? 'error' 
                      : 'warning'
                }
                sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2, px: 1 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Confidence: {(recommendationData.confidence * 100).toFixed(0)}%
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {timeframeButtons.map((button) => (
              <Button
                key={button.value}
                variant={timeframe === button.value ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleTimeframeChange(button.value)}
                sx={{ mr: 1 }}
              >
                {button.label}
              </Button>
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveAnalysis}
            disabled={!recommendationData}
          >
            Save Analysis
          </Button>
        </Box>
      </Paper>
      
      {/* Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {loading.stock ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error.stock ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error.stock}
          </Alert>
        ) : (
          <StockChart data={stockData} symbol={symbol} />
        )}
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Causal Analysis" />
          <Tab label="Investment Recommendation" />
          <Tab label="News" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <CausalAnalysis 
              data={causalData} 
              isLoading={loading.causal} 
              error={error.causal} 
            />
          )}
          
          {tabValue === 1 && (
            <InvestmentRecommendation 
              data={recommendationData} 
              isLoading={loading.recommendation} 
              error={error.recommendation} 
            />
          )}
          
          {tabValue === 2 && (
            <StockNews symbol={symbol} />
          )}
        </Box>
      </Paper>
      
      {/* Notes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personal Notes
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Add your personal notes about this stock..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveAnalysis}
          disabled={!recommendationData}
        >
          Save Analysis with Notes
        </Button>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StockAnalysis;