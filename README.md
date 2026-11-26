# 💬 Real-Time Chat Application

A clean, human-friendly real-time mobile chat application built with **React Native / Expo** and powered by a **Node.js + Socket.io** backend server. You can chat with your friends in real-time and share photos from your camera or photo gallery.

---

## 🌟 Features

- **Real-Time 1-on-1 Messaging**: Instant messaging between connected users powered by WebSockets (`Socket.io`).
- **Online / Offline Status**: See which friends are active with live green status indicators.
- **Photo Sharing**: Capture photos with your camera (`expo-camera`) or pick from your phone library (`expo-image-picker`) and send them directly in the chat.
- **Conversations List**: Displays recent active conversations with last messages and time.
- **Friends Directory**: Explore all registered friends on the server and start new chats.
- **Cross-Platform**: Runs on iOS, Android, and Web browsers.

---

## 🚀 How to Run the App & Server

To chat with your friends, you need to run **two things**:
1. The **Backend Server** (relays messages between devices)
2. The **Mobile/Web App** (where you chat)

### Step 1: Start the Backend Server

Open a terminal in the project directory and run:

```bash
npm run server
```

You will see:
```text
====================================================
🚀 Chat Application Server is RUNNING!
   Local URL:    http://localhost:3000
   Network URL:  http://10.7.6.11:3000

📱 To connect from another phone on the same Wi-Fi:
   Use Network URL: http://10.7.6.11:3000
====================================================
```

*Keep this terminal running!*

---

### Step 2: Start the Expo Client App

Open a **second terminal** in the same project directory and run:

```bash
npm start
```

From here you can open the app on:
- **Web Browser**: Press **`w`** in the terminal (opens in your browser at `http://localhost:8081`).
- **Your Physical Phone**: Install the **Expo Go** app from App Store / Google Play and scan the QR code.
- **iOS Simulator**: Press **`i`**.
- **Android Emulator**: Press **`a`**.

---

## 👥 How to Chat with Friends (Step-by-Step)

### Option A: Testing on the Same Computer (Quickest!)
1. Start the server (`npm run server`).
2. Run `npm start` and press **`w`** to open in your browser.
3. In the first browser window:
   - Type your name: **`Rahul`**
   - Click **Join Chat**.
4. Open an **Incognito / Private tab** (or a second browser):
   - Open `http://localhost:8081`.
   - Type friend's name: **`Priya`**.
   - Click **Join Chat**.
5. Tap **Start New Chat**, choose each other, and send live messages and photos!

---

### Option B: Chatting with Friends Across Two Phones on the Same Wi-Fi
1. Make sure your computer and your friend's phone are connected to the **same Wi-Fi network**.
2. Note your computer's **Network URL** shown by the server (e.g. `http://10.7.6.11:3000`).
3. Open the app on both phones (via Expo Go).
4. On the login screen:
   - Enter your name (e.g. "Prashant").
   - Tap **⚙️ Server Settings (Advanced)** and make sure the server URL matches your computer's IP (e.g. `http://10.7.6.11:3000`).
   - Tap **Join Chat**.
5. Now you and your friend are connected to your server and can chat in real time!

---

## 🧠 How the Architecture Works (Simple Explanation)

```
[Phone A / Rahul]  ──(WebSocket)──►  [Node.js Server]  ◄──(WebSocket)──  [Phone B / Priya]
  Sends "Hi Priya!"                      Saves message                       Receives "Hi Priya!"
                                       forwards instantly
```

1. **`server/server.js`**:
   - A lightweight Express + Socket.io server.
   - Manages connected users, keeps track of who is online, and stores messages.
   - When user A sends a message to user B, the server receives it and instantly pushes it to user B's socket.
2. **`socket.js`**:
   - Manages the client-side socket connection, auto-reconnects if disconnected, and holds session state.
3. **`screens/LoginScreen.jsx`**:
   - Takes user's name and server IP address.
4. **`screens/Conversations.jsx`**:
   - Displays all recent chats and online statuses.
5. **`screens/ChatScreen.jsx`**:
   - Displays message bubbles, handles real-time send/receive, and attaches photos.

---

## 🐳 Running the Server in Docker

You can run the chat server inside an isolated Docker container with a single command.

### Using Docker Compose (Recommended)
```bash
docker compose up --build -d
```
- To view live logs: `docker compose logs -f`
- To stop the container: `docker compose down`

### Using Docker CLI
```bash
# 1. Build the lightweight image
docker build -t chat-server .

# 2. Run the container
docker run -d -p 3000:3000 --name chat-server chat-server

# 3. Check logs
docker logs -f chat-server
```

Once running in Docker, the server will be accessible at `http://localhost:3000` (and on your local network IP `http://<YOUR_IP>:3000` for mobile phones).
