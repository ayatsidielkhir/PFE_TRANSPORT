import { io } from 'socket.io-client';

const socket = io('https://mme-backend.onrender.com/api', {
  withCredentials: true,
});

export default socket;