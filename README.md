# ChatWave — WhatsApp-style Messaging App

A real-time messaging web app inspired by WhatsApp, built with **Node.js, Express, and Socket.IO**. Runs entirely locally — great as a starting point to extend into a full product.

## Features
- Real-time messaging (instant delivery via WebSockets)
- WhatsApp-style chat bubble UI (green bubbles, avatars, timestamps)
- Multiple chat rooms — type any room name to create/join it (acts like group chats)
- Online users list per room
- "Typing..." indicator
- Join/leave system messages
- Responsive layout (works on mobile browser widths too)

## Requirements
- [Node.js](https://nodejs.org) v18 or later (includes npm)

## Setup (in VS Code)

1. Unzip this project and open the folder in VS Code.
2. Open a terminal in VS Code: `Terminal > New Terminal`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser at **http://localhost:3000**
6. To test real-time chat, open the same URL in a second browser tab (or another browser/incognito window), pick a different name, join the **same room name**, and start chatting.

## Project structure
```
whatsapp-clone/
├── server.js          # Express + Socket.IO backend (all real-time logic)
├── package.json
├── public/
│   ├── index.html      # App markup (login screen + chat UI)
│   ├── style.css        # WhatsApp-style styling
│   └── script.js         # Frontend Socket.IO client logic
└── README.md
```

## How it works
- Each browser tab connects via Socket.IO. Picking a "room" name is like opening a chat/group — everyone who joins the same room name sees the same conversation.
- Messages are currently stored **in memory** on the server, so they reset when the server restarts. This keeps the starter simple with zero setup.

## Ideas to extend this into a production app
- **Persistence**: add MongoDB or PostgreSQL to store users and message history permanently.
- **Auth**: replace the plain-name login with real accounts (email/phone + password, JWT sessions).
- **1:1 vs Group chats**: separate data models instead of a flat "room" string.
- **Media messages**: image/video/file upload and preview (e.g. using multer + cloud storage).
- **Read receipts / delivery status**: double-check marks like WhatsApp.
- **Push notifications**: via a service worker + Web Push API for browser notifications.
- **End-to-end encryption**: for genuine privacy (e.g. using the Signal Protocol / libsodium).
- **Deploy**: host the Node server (Render, Railway, Fly.io, etc.) and point a custom domain at it.

## License
Free to use and modify for learning or as a starting point for your own app.
