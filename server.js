// server.js
// Simple real-time messaging backend (WhatsApp-style) using Express + Socket.IO
// In-memory storage only -- swap in a real DB (MongoDB/Postgres) for production.

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ---- In-memory state ----
// users: socket.id -> { username, room }
const users = {};
// messages: room -> [ { username, text, time, id } ]
const messages = {};
// rooms are created on demand when users join them (acts like a "chat" / contact)

function getRoomMessages(room) {
  if (!messages[room]) messages[room] = [];
  return messages[room];
}

function getUsersInRoom(room) {
  return Object.values(users)
    .filter((u) => u.room === room)
    .map((u) => u.username);
}

io.on('connection', (socket) => {
  // Join a room (room name = the "chat", e.g. a DM key or group name)
  socket.on('join', ({ username, room }) => {
    username = (username || 'Anonymous').trim().slice(0, 30);
    room = (room || 'general').trim().slice(0, 50) || 'general';

    users[socket.id] = { username, room };
    socket.join(room);

    // Send history to the joining user
    socket.emit('history', getRoomMessages(room));

    // Notify the room
    const sysMsg = {
      id: `sys-${Date.now()}`,
      system: true,
      text: `${username} joined the chat`,
      time: new Date().toISOString(),
    };
    getRoomMessages(room).push(sysMsg);
    io.to(room).emit('message', sysMsg);

    io.to(room).emit('online-users', getUsersInRoom(room));
  });

  // Switch rooms without reconnecting
  socket.on('switch-room', ({ room }) => {
    const user = users[socket.id];
    if (!user) return;
    socket.leave(user.room);
    user.room = room;
    socket.join(room);
    socket.emit('history', getRoomMessages(room));
    io.to(room).emit('online-users', getUsersInRoom(room));
  });

  // New chat message
  socket.on('message', ({ text }) => {
    const user = users[socket.id];
    if (!user || !text || !text.trim()) return;

    const msg = {
      id: `${socket.id}-${Date.now()}`,
      username: user.username,
      text: text.trim().slice(0, 2000),
      time: new Date().toISOString(),
    };
    getRoomMessages(user.room).push(msg);
    io.to(user.room).emit('message', msg);
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    const user = users[socket.id];
    if (!user) return;
    socket.to(user.room).emit('typing', { username: user.username, isTyping });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;
    delete users[socket.id];

    const sysMsg = {
      id: `sys-${Date.now()}`,
      system: true,
      text: `${user.username} left the chat`,
      time: new Date().toISOString(),
    };
    getRoomMessages(user.room).push(sysMsg);
    io.to(user.room).emit('message', sysMsg);
    io.to(user.room).emit('online-users', getUsersInRoom(user.room));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
