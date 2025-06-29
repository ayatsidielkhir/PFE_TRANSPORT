import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mme-backend.onrender.com/api', 
  withCredentials: true,
});

export default instance;
