import axios from 'axios';

const api = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
