import axios from 'axios';

export default axios.create({
  baseURL: '/', // Adjust if backend is on a different port
  withCredentials: false,
});
