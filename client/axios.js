import axios from 'axios';

// Create an axios instance with fallback options
const createAxiosInstance = () => {
  // Primary backend URL (Render)
  const primaryBaseURL = 'https://secret-ai-uz8m.onrender.com';
  
  // Try to detect if we're on GitHub Pages (for fallback mechanisms)
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Create the axios instance with the primary URL
  const instance = axios.create({
    baseURL: primaryBaseURL,
    withCredentials: false,
    timeout: 15000, // 15 second timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add request interceptor to prevent caching
  instance.interceptors.request.use(config => {
    // Add cache busting parameter to GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _cb: Date.now()
      };
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });
  
  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    response => {
      console.log('API Success:', {
        url: response.config?.url,
        method: response.config?.method,
        status: response.status,
        data: response.data ? 'Data received' : 'No data'
      });
      return response;
    },
    error => {
      // Log detailed error information
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

// Export the configured axios instance
export default createAxiosInstance();
