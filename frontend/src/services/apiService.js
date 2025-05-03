import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Stock API
export const stockAPI = {
  getStockData: (symbol, timeframe = '1mo') => api.get(`/stocks/${symbol}?timeframe=${timeframe}`),
  searchStocks: (query) => api.get(`/stocks/search?q=${query}`),
  getPopularStocks: () => api.get('/stocks/popular'),
  getStockDetails: (symbol) => api.get(`/stocks/details/${symbol}`)
};

// Analysis API
export const analysisAPI = {
  getCausalAnalysis: (symbol) => api.get(`/analysis/causal/${symbol}`),
  getRecommendation: (symbol) => api.get(`/analysis/recommendation/${symbol}`),
  getSectorAnalysis: (sector) => api.get(`/analysis/sector/${sector}`),
  saveAnalysis: (data) => api.post('/analysis/save', data),
  getSavedAnalyses: () => api.get('/analysis/saved'),
  deleteSavedAnalysis: (id) => api.delete(`/analysis/saved/${id}`)
};

// News API
export const newsAPI = {
  getStockNews: (symbol) => api.get(`/news/${symbol}`),
  getMarketNews: () => api.get('/news/market'),
  getSectorNews: (sector) => api.get(`/news/sector/${sector}`)
};

export default api;