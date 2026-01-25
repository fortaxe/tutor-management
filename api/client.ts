
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
});

// For local testing if needed, you could add logic to detect environment
// client.defaults.baseURL = window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api';

export default client;
