import { io } from 'socket.io-client';
import { DEFAULT_SERVER_URL } from './config';

let socket = null;
let currentUser = null;
let serverUrl = DEFAULT_SERVER_URL;

// get active socket connection or create new one
export function getSocket(customUrl) {
  const targetUrl = (customUrl || serverUrl).trim().replace(/\/+$/, '');

  if (!socket || socket.disconnected || serverUrl !== targetUrl) {
    if (socket) {
      socket.disconnect();
    }

    serverUrl = targetUrl;
    socket = io(targetUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 10000,
    });

    // rejoin if connection dropped and reconnected
    socket.on('connect', () => {
      if (currentUser) {
        socket.emit('login', { name: currentUser.name });
      }
    });
  }

  return socket;
}

// log in with username
export function login(name, targetUrl = DEFAULT_SERVER_URL) {
  return new Promise((resolve, reject) => {
    const s = getSocket(targetUrl);

    const timer = setTimeout(() => {
      reject(
        new Error(
          'Could not reach server. Make sure server is running and your phone and PC are on the same Wi-Fi.'
        )
      );
    }, 10000);

    s.emit('login', { name }, (response) => {
      clearTimeout(timer);
      if (response && response.success) {
        currentUser = response.user;
        resolve(response.user);
      } else {
        reject(new Error(response?.error || 'Login failed'));
      }
    });
  });
}

// return current logged in user
export function getCurrentUser() {
  return currentUser;
}

// logout and disconnect
export function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
}
