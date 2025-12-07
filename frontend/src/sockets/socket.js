import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5100', {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

export default socket;

