import axios from 'axios';

// Use the Render backend for all API requests
export default axios.create({
  baseURL: 'https://secret-ai-uz8m.onrender.com',
  withCredentials: false,
});
