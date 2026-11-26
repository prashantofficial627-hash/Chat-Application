const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8,
});

// store users and messages in memory
const users = new Map();
const messages = [];

// return list of users with online status
function getAllUsers() {
  return Array.from(users.values()).map((u) => ({
    id: u.id,
    name: u.name,
    isOnline: u.isOnline,
  }));
}

// find all messages exchanged between two people
function getChatHistory(userA, userB) {
  return messages.filter(
    (m) =>
      (m.senderId === userA && m.receiverId === userB) ||
      (m.senderId === userB && m.receiverId === userA)
  );
}

// get active chat conversations for home screen
function getRecentChats(userId) {
  const chats = new Map();

  for (const m of messages) {
    if (m.senderId === userId || m.receiverId === userId) {
      const friendId = m.senderId === userId ? m.receiverId : m.senderId;
      const friend = users.get(friendId);

      if (friend) {
        chats.set(friendId, {
          id: friend.id,
          name: friend.name,
          isOnline: friend.isOnline,
          lastMessage: m.image ? 'Photo' : m.text,
        });
      }
    }
  }

  return Array.from(chats.values());
}

// simple health check
app.get('/', (req, res) => {
  res.send('Chat server is running');
});

// socket connection logic
io.on('connection', (socket) => {
  let loggedInUserId = null;

  // when someone enters their name to join
  socket.on('login', ({ name }, callback) => {
    if (!name || !name.trim()) return;

    const username = name.trim();
    const userId = username.toLowerCase().replace(/\s+/g, '-');

    const userData = {
      id: userId,
      name: username,
      isOnline: true,
      socketId: socket.id,
    };

    users.set(userId, userData);
    loggedInUserId = userId;

    if (callback) {
      callback({ success: true, user: { id: userId, name: username } });
    }

    // broadcast updated user list so everyone sees who is online
    io.emit('users_updated', getAllUsers());
  });

  // send user list to requester
  socket.on('get_users', (callback) => {
    if (callback) callback(getAllUsers());
  });

  // send conversation history between two users
  socket.on('get_messages', ({ userId, friendId }, callback) => {
    if (callback) callback(getChatHistory(userId, friendId));
  });

  // send active chats for home screen
  socket.on('get_conversations', ({ userId }, callback) => {
    if (callback) callback(getRecentChats(userId));
  });

  // handle new text or photo message
  socket.on('send_message', (data, callback) => {
    const { senderId, receiverId, text, image, id, createdAt } = data;
    if (!senderId || !receiverId || (!text && !image)) return;

    const sender = users.get(senderId);
    const receiver = users.get(receiverId);

    const newMsg = {
      id: id || Date.now().toString(),
      senderId,
      senderName: sender ? sender.name : 'Unknown',
      receiverId,
      text: text || '',
      image: image || null,
      createdAt: createdAt || new Date().toISOString(),
    };

    messages.push(newMsg);

    // push message to receiver if they are currently online
    if (receiver && receiver.socketId && receiver.socketId !== socket.id) {
      io.to(receiver.socketId).emit('new_message', newMsg);
    }

    if (callback) callback({ success: true, message: newMsg });

    // refresh conversations list for all clients
    io.emit('conversations_updated');
  });

  // handle user disconnect
  socket.on('disconnect', () => {
    if (loggedInUserId && users.has(loggedInUserId)) {
      const user = users.get(loggedInUserId);
      user.isOnline = false;
      io.emit('users_updated', getAllUsers());
    }
  });
});

const PORT = process.env.PORT || 3000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️ Port ${PORT} is already in use by another process.`);
    console.error(`Tip: If Docker is running, stop it with: docker stop chat-server\n`);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
