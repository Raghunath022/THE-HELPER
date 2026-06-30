import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:10000/api'
    : 'https://smart-agri-platform-1.onrender.com/api',
  timeout: 15000, // 15 seconds timeout to allow ML model inference
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for network timeouts or gateway errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request Timeout: The ML Microservice might be booting up.');
      return Promise.reject(new Error('The request timed out. The AI service may be starting up, please try again.'));
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 500 || error.response.status === 503) {
        console.error('Server Error:', error.response.data);
        return Promise.reject(new Error('The AI engine is currently unavailable. Please try again later.'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received');
      return Promise.reject(new Error('Network error. Cannot connect to the server.'));
    }

    return Promise.reject(error);
  }
);

/**
 * Sends telemetry data to the Crop Recommendation Engine
 * @param {Object} telemetryData { N, P, K, ph, temperature, humidity, rainfall }
 * @returns {Promise} Resolves with prediction object
 */
export const predictCrop = async (telemetryData) => {
  const response = await api.post('/predict', telemetryData);
  return response.data;
};

/**
 * Fetches market forecast (historical + ARIMA prediction)
 * @param {string} cropName e.g., 'rice', 'wheat'
 * @param {string} state (Optional)
 * @returns {Promise} Resolves with { crop, trend, forecast_timeline }
 */
export const getMarketForecast = async (cropName, state = 'General') => {
  const response = await api.get('/market/forecast', {
    params: { commodity: cropName, state }
  });
  return response.data;
};

export default api;
