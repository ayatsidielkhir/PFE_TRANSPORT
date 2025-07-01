import { io } from 'socket.io-client';

const socket = io('https://mme-backend.onrender.com', {
  withCredentials: true,
  transports: ['websocket'], // facultatif, force WebSocket
});

export default socket;
