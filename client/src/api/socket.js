// client/src/api/socket.js
import { io } from 'socket.io-client';

let socket;
export function initSocket(token) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
  });
  return socket;
}

export function sendMessage({ to, content }) {
  socket?.emit('message:send', { to, content });
}
