import { io } from "socket.io-client";

// Connect to same origin — Vite proxy forwards /socket.io to backend
const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
