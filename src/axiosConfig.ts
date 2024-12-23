import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common['Pragma'] = 'no-cache';
axios.defaults.headers.common['Expires'] = '0';

// Add X-API-KEY header to all requests
axios.defaults.headers.common['X-API-KEY'] = import.meta.env.VITE_API_TOKEN;
