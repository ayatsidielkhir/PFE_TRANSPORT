import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mme-backend.onrender.com', // ✅ Corrigé ici
});

export default instance;
