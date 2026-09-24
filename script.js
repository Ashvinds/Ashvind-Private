const socket = io();

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');

const myAvatar = document.getElementById('my-avatar');
const myUsername = document.getElementById('my-username');
const roomNameEl = document.getElementById('room-name');
const onlineList = document.getElementById('online-list');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const newRoomInput = document.getElementById('new-room-input');
const goRoomBtn = document.getElementById('go-room-btn');

let username = '';
let currentRoom = '';
let typingTimeout = null;

function join() {
  username = usernameInput.value.trim() || `User${Math.floor(Math.random() * 1000)}`;
  currentRoom = roomInput.value.trim() || 'general';

  socket.emit('join', { username, room: currentRoom });

  myUsername.textContent = username;
  myAvatar.textContent = username[0].toUpperCase();
  roomNameEl.textContent = currentRoom;

  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

joinBtn.addEventListener('click', join);
[usernameInput, roomInput].forEach((el) =>
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') join(); })
);

goRoomBtn.addEventListener('click', switchRoom);
newRoomInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') switchRoom(); });

function switchRoom() {
  const room = newRoomInput.value.trim();
  if (!room || room === currentRoom) return;
  currentRoom = room;
  roomNameEl.textContent = room;
  messagesEl.innerHTML = '';
  newRoomInput.value = '';
  socket.emit('switch-room', { room });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMessage(msg) {
  const div = document.createElement('div');

  if (msg.system) {
    div.className = 'msg system';
    div.textContent = msg.text;
  } else {
    const mine = msg.username === username;
    div.className = `msg ${mine ? 'mine' : 'theirs'}`;
    div.innerHTML = `
      ${mine ? '' : `<span class="sender">${escapeHtml(msg.username)}</span>`}
      ${escapeHtml(msg.text)}
      <span class="time">${formatTime(msg.time)}</span>
    `;
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

socket.on('history', (msgs) => {
  messagesEl.innerHTML = '';
  msgs.forEach(renderMessage);
});

socket.on('message', renderMessage);

socket.on('online-users', (list) => {
  onlineList.innerHTML = '';
  list.forEach((name) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(name)}</span>`;
    onlineList.appendChild(li);
  });
});

socket.on('typing', ({ username: who, isTyping }) => {
  typingIndicator.textContent = isTyping ? `${who} is typing...` : '';
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value;
  if (!text.trim()) return;
  socket.emit('message', { text });
  messageInput.value = '';
  socket.emit('typing', false);
});

let isTyping = false;
messageInput.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', true);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit('typing', false);
  }, 1200);
});
