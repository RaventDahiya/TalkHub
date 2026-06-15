# 🎤 TalkHub — Complete Interview Preparation Guide

> **Project**: TalkHub — Real-Time Group Chat Application  
> **Type**: Full-Stack MERN (MongoDB, Express, React, Node.js) + WebSockets  
> **GitHub**: RaventDahiya/TalkHub

---

## 📑 Table of Contents

1. [Project Overview & Elevator Pitch](#1-project-overview--elevator-pitch) (Line 35)
2. [Tech Stack Deep Dive](#2-tech-stack-deep-dive) (Line 59)
3. [System Architecture](#3-system-architecture) (Line 94)
4. [Folder Structure Explained](#4-folder-structure-explained) (Line 146)
5. [Database Design (MongoDB Schemas)](#5-database-design-mongodb-schemas) (Line 204)
6. [Backend Detailed Walkthrough](#6-backend-detailed-walkthrough) (Line 270)
7. [Frontend Detailed Walkthrough](#7-frontend-detailed-walkthrough) (Line 355)
8. [Socket.IO — Real-Time Communication](#8-socketio--real-time-communication) (Line 462)
9. [Authentication Flow (JWT)](#9-authentication-flow-jwt) (Line 513)
10. [Key Features Explained](#10-key-features-explained) (Line 584)
11. [API Endpoints Reference](#11-api-endpoints-reference) (Line 640)
12. [State Management Strategy](#12-state-management-strategy) (Line 667)
13. [Design Patterns Used](#13-design-patterns-used) (Line 709)
14. [Security Considerations](#14-security-considerations) (Line 754)
15. [Performance Optimizations](#15-performance-optimizations) (Line 793)
16. [Challenges Faced & Solutions](#16-challenges-faced--solutions) (Line 815)
17. [Future Improvements / Scalability](#17-future-improvements--scalability) (Line 843)
18. [Common Interview Questions & Answers](#18-common-interview-questions--answers) (Line 883)
19. [Code Snippets to Explain in Interview](#19-code-snippets-to-explain-in-interview) (Line 963)
20. [How to Run the Project](#20-how-to-run-the-project) (Line 1033)
21. [Production Deployment & DevOps](#21-production-deployment--devops) (Line 1071)
22. [Mobile Application (React Native) Development](#22-mobile-application-react-native-development) (Line 1143)

---

## 1. Project Overview & Elevator Pitch

### 30-Second Pitch
> "TalkHub is a full-stack real-time group chat application I built using the MERN stack and Socket.IO. It supports user authentication with JWT, creating public and private chat rooms, real-time messaging with WebSockets, typing indicators, message reactions, online user tracking, message history with cursor-based pagination, and system notifications — all with a polished, responsive UI."

### What It Does
- **User Registration & Login** with JWT-based authentication
- **Create/Join/Leave Chat Rooms** (public + private with access keys)
- **Real-time Messaging** via WebSocket (Socket.IO)
- **Typing Indicators** that broadcast to other users
- **Message Reactions** with emoji picker (👍 ❤️ 😂 😮 😢 🙏)
- **Online User Tracking** per room
- **Message History** with cursor-based timestamp pagination
- **System Messages** for join/leave events
- **Responsive UI** with sidebar, chat area, and online users panel

### Why I Built It
- Wanted to demonstrate understanding of **real-time bidirectional communication**
- Showcase **full-stack development** skills end-to-end
- Practice **state management** in complex React applications
- Learn WebSocket architecture at a practical level

---

## 2. Tech Stack Deep Dive

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | Runtime | Server-side JavaScript execution |
| **Express.js** | ^4.19.2 | REST API framework, middleware management |
| **MongoDB** | Cloud (Atlas) | NoSQL document database for flexible schema |
| **Mongoose** | ^8.4.1 | ODM for MongoDB — schemas, validation, queries |
| **Socket.IO** | ^4.7.5 | Real-time bidirectional event-based communication |
| **JWT (jsonwebtoken)** | ^9.0.2 | Stateless authentication tokens |
| **bcryptjs** | ^2.4.3 | Password hashing with salt rounds |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing middleware |
| **dotenv** | ^16.4.5 | Environment variable management |
| **nodemon** | ^3.1.3 | Dev-only: auto-restart server on file changes |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | ^18.3.1 | Component-based UI library |
| **React Router DOM** | ^6.23.1 | Client-side routing & navigation |
| **Vite** | ^5.2.11 | Fast build tool & dev server (replaces CRA) |
| **Axios** | ^1.7.2 | HTTP client with interceptors |
| **Socket.IO Client** | ^4.7.5 | WebSocket client library |
| **Vanilla CSS** | — | Custom styling without CSS frameworks |

### Why These Choices?
- **MongoDB over SQL**: Chat messages are document-oriented; flexible schema fits nested reactions. No complex joins needed.
- **Socket.IO over raw WebSockets**: Auto-reconnection, room namespaces, fallback polling, event-based API.
- **Vite over CRA**: 10-100x faster HMR, native ES modules, smaller bundle.
- **Context API over Redux**: Sufficient for this app's complexity; avoids boilerplate.
- **JWT over Sessions**: Stateless, scalable, no server-side session storage needed.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Login/   │  │  Chat    │  │ Sidebar  │  │  Context   │  │
│  │ Register  │  │  Room    │  │ (Rooms/  │  │ (Auth +    │  │
│  │   Pages   │  │  View    │  │  Users)  │  │  Socket)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│         │              │              │             │        │
│         └──── HTTP (Axios) ───────────┘      Socket.IO      │
└──────────────────────┬──────────────────────────┬───────────┘
                       │ REST API                 │ WebSocket
                       ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js + Express)               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Routes     │  │  Middleware   │  │  Socket Handler     │ │
│  │ /api/auth   │  │  (JWT Auth)  │  │  (Real-time events) │ │
│  │ /api/rooms  │  │              │  │                     │ │
│  └──────┬──────┘  └──────────────┘  └─────────┬───────────┘ │
│         │                                      │             │
│         └──────────── Mongoose ODM ────────────┘             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────┐
              │   MongoDB Atlas      │
              │  ┌────────────────┐  │
              │  │ Users          │  │
              │  │ Rooms          │  │
              │  │ Messages       │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

### Data Flow for Sending a Message
```
1. User types message → MessageInput component
2. Press Enter → handleSendMessage() called
3. socket.emit('chatMessage', { roomId, userId, username, message })
4. Server receives 'chatMessage' event
5. Server saves Message document to MongoDB
6. Server broadcasts: io.to(roomId).emit('message', newMessage)
7. All clients in room receive 'message' event
8. React state updates: setMessages(prev => [...prev, msg])
9. MessageList re-renders → auto-scrolls to bottom
```

---

## 4. Folder Structure Explained

```
TalkHub/
├── chat-app-backend/
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example            # Template for env vars (no secrets)
│   ├── server.js               # Entry point: Express + Socket.IO + MongoDB setup
│   ├── package.json            # Backend dependencies & scripts
│   ├── middleware/
│   │   └── auth.js             # JWT token verification middleware
│   ├── models/
│   │   ├── User.js             # Mongoose User schema
│   │   ├── Room.js             # Mongoose Room schema
│   │   └── Message.js          # Mongoose Message schema
│   ├── routes/
│   │   ├── auth.js             # Register, Login, Verify endpoints
│   │   └── rooms.js            # CRUD rooms, join/leave, message history
│   └── socket/
│       └── socketHandler.js    # All Socket.IO event handlers
│
├── chat-app-frontend/
│   ├── package.json            # Frontend dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── index.jsx           # React DOM render entry point
│       ├── App.jsx             # Root component: routing + context providers
│       ├── styles/
│       │   └── app.css         # Global CSS (~17KB of custom styles)
│       ├── utils/
│       │   └── api.js          # Axios instance with JWT interceptor
│       ├── context/
│       │   ├── AuthContext.jsx  # Auth state: user, login, register, logout
│       │   └── SocketContext.jsx # Socket.IO connection lifecycle
│       └── components/
│           ├── Auth/
│           │   ├── Login.jsx    # Login form page
│           │   └── Register.jsx # Registration form page
│           ├── Chat/
│           │   ├── ChatRoom.jsx      # Main orchestrator (475 lines)
│           │   ├── MessageList.jsx   # Renders message list + scroll
│           │   ├── MessageInput.jsx  # Input field + typing indicator
│           │   ├── Message.jsx       # Single message bubble + reactions
│           │   ├── TypingIndicator.jsx # "User is typing..." display
│           │   ├── Avatar.jsx        # Hash-based colored avatar
│           │   ├── ConfirmModal.jsx  # Reusable confirm dialog
│           │   └── ConfirmModal.css  # Modal styles
│           └── Sidebar/
│               ├── RoomList.jsx      # Room list with search filter
│               ├── CreateRoom.jsx    # Modal form for creating rooms
│               ├── OnlineUsers.jsx   # Right sidebar: online users
│               └── OnlineUsers.css   # Online users styles
│
└── README.md
```

---

## 5. Database Design (MongoDB Schemas)

### User Schema
```javascript
{
  username:  { type: String, required, unique, trim, minlength: 3 },
  email:     { type: String, required, unique, trim, lowercase, regex validated },
  password:  { type: String, required, minlength: 6 },  // bcrypt hashed
  createdAt: { type: Date, default: Date.now }
}
```
**Key Design Decisions:**
- `unique: true` on both `username` and `email` → prevents duplicates at DB level
- `lowercase: true` on email → case-insensitive email matching
- `regex: /^\S+@\S+\.\S+$/` → basic email format validation
- Password stored as bcrypt hash (10 salt rounds), never in plain text

### Room Schema
```javascript
{
  name:        { type: String, required, unique, trim, minlength: 3 },
  description: { type: String, trim, default: '' },
  createdBy:   { type: ObjectId, ref: 'User', required },
  members:     [{ type: ObjectId, ref: 'User' }],
  isPrivate:   { type: Boolean, default: false },
  accessKey:   { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now }
}
```
**Key Design Decisions:**
- `members` array stores ObjectId references → can `.populate('members', 'username')` to resolve user info
- `createdBy` reference → tracks room ownership
- `isPrivate` + `accessKey` → support for password-protected rooms
- Access key stored as plain text (improvement: could hash it)

### Message Schema
```javascript
{
  room:           { type: ObjectId, ref: 'Room', required },
  sender:         { type: ObjectId, ref: 'User', required },
  senderUsername: { type: String, required },
  content:        { type: String, required, trim },
  messageType:    { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  reactions:      [{ username: String, reaction: String }],
  timestamp:      { type: Date, default: Date.now }
}

// Compound index for efficient pagination
MessageSchema.index({ room: 1, timestamp: -1 });
```
**Key Design Decisions:**
- `senderUsername` denormalized for performance → avoids population on every message fetch
- `reactions` embedded as subdocument array → atomic updates, no separate collection needed
- Compound index `{ room: 1, timestamp: -1 }` → optimizes the most common query pattern (messages by room, sorted by time)
- `messageType` enum → extensible for future file/image support
- `timestamp` with descending index → efficient cursor-based pagination

### Why NoSQL (MongoDB) for Chat?
1. **Schema Flexibility**: Messages can have optional reactions, different message types
2. **Embedded Documents**: Reactions stored inside messages, no joins needed
3. **Horizontal Scalability**: Sharding by room for future scaling
4. **Document-Oriented**: Each message is a self-contained document
5. **Fast Writes**: Chat apps are write-heavy; MongoDB handles high-throughput writes well

---

## 6. Backend Detailed Walkthrough

### server.js — Application Entry Point
```javascript
// 1. Create Express app + HTTP server
const app = express();
const server = http.createServer(app);

// 2. Attach Socket.IO to the HTTP server
const io = socketIo(server, { cors: { origin: '*' } });

// 3. Standard middleware
app.use(cors());         // Enable CORS for all origins
app.use(express.json());  // Parse JSON request bodies

// 4. Connect to MongoDB Atlas
mongoose.connect(MONGO_URI);

// 5. Inject io into every request (for REST routes to broadcast socket events)
app.use((req, res, next) => {
  req.io = io;  // Now any route handler can call req.io.emit(...)
  next();
});

// 6. Mount REST routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));

// 7. Initialize WebSocket event handlers
require('./socket/socketHandler')(io);

// 8. Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Something went wrong on the server!' });
});
```

**Important Pattern — `req.io` Middleware:**
This is a critical design decision. When a user leaves a room via REST API (`POST /api/rooms/:id/leave`), we need to notify other users in real-time. By injecting `io` into the request object, REST route handlers can broadcast Socket.IO events.

### Authentication Middleware (middleware/auth.js)
```javascript
module.exports = function(req, res, next) {
  // 1. Extract Bearer token from Authorization header
  const authHeader = req.header('Authorization');
  let token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  // 2. If no token, reject with 401
  if (!token) return res.status(401).json({ message: 'No authorization token' });

  // 3. Verify and decode the JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // { id, username, email }
  next();
};
```

### Socket Handler (socket/socketHandler.js) — Heart of Real-Time
```javascript
// In-memory store of active users per room
const activeRoomUsers = {};
// Structure: { "roomId123": [ { socketId, userId, username }, ... ] }
```

**Socket Events Handled:**

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | Client → Server | User enters a room; loads history, updates online list |
| `chatMessage` | Client → Server | New message; saves to DB, broadcasts to room |
| `typing` | Client → Server → Others | Typing indicator; relayed to other room members |
| `messageReaction` | Client → Server → All | Add/update/remove emoji reaction on a message |
| `leaveRoom` | Client → Server | Explicit room exit; updates online list |
| `disconnect` | Auto | Browser close/refresh; cleanup from all rooms |
| `message` | Server → Clients | New message broadcast |
| `loadHistory` | Server → Client | Initial 50 messages on room join |
| `onlineUsers` | Server → Room | Updated list of active users |
| `userJoined` | Server → Room | System notification of new user |
| `reactionUpdate` | Server → Room | Updated reactions for a message |
| `roomCreated` | Server → All | New room created (global broadcast) |

---

## 7. Frontend Detailed Walkthrough

### App.jsx — Root Component
```
AuthProvider → SocketProvider → Router
  ├── /login     → PublicRoute  → Login
  ├── /register  → PublicRoute  → Register
  ├── /chat      → ProtectedRoute → ChatRoom
  └── /*         → Redirect to /chat
```

**Route Guards:**
- `ProtectedRoute`: Checks `isAuthenticated` from AuthContext; redirects to `/login` if not
- `PublicRoute`: Redirects to `/chat` if already logged in (prevents seeing login page when authenticated)

### ChatRoom.jsx — The Main Orchestrator (475 lines)
This is the most complex component. It manages:

1. **Room Management**: Fetches rooms, handles room selection, create/join/leave
2. **Socket Lifecycle**: Emits `joinRoom`/`leaveRoom`, registers 7 event listeners
3. **Message State**: Accumulates messages, handles pagination
4. **Online Users**: Tracks active users in current room
5. **Typing State**: Manages typing indicator for other users
6. **UI State**: Sidebar toggle, modal state, join form state

**Critical useEffect for Room Switching:**
```javascript
useEffect(() => {
  // 1. Emit joinRoom to server
  socket.emit('joinRoom', { roomId, username, userId });
  
  // 2. Reset all room-specific state
  setMessages([]);
  setOnlineUsers([]);
  setTypingUsers([]);
  
  // 3. Register event listeners (message, loadHistory, onlineUsers, etc.)
  socket.on('message', handleNewMessage);
  socket.on('loadHistory', handleLoadHistory);
  // ... more listeners
  
  // 4. Cleanup on unmount or room change
  return () => {
    socket.emit('leaveRoom', { roomId, username });
    socket.off('message', handleNewMessage);
    // ... remove all listeners
  };
}, [activeRoomId, socketId, userId, username, socket]);
```

### Component Hierarchy
```
ChatRoom
├── Navbar (inline)
│   ├── Avatar
│   └── Logout Button
├── Sidebar (left)
│   ├── Create Room Button
│   └── RoomList
│       └── Room Search + Room Items
├── Chat Container (center)
│   ├── Chat Header (room name, online count, leave button)
│   ├── MessageList
│   │   ├── Load Older Button
│   │   └── Message (each)
│   │       └── Reaction Picker + Badges
│   ├── TypingIndicator
│   └── MessageInput
├── OnlineUsers (right sidebar)
├── CreateRoom (modal)
└── ConfirmModal (leave confirmation)
```

### Avatar Component — Deterministic Color Generation
```javascript
// Hash-based color generation ensures same username = same colors every time
const generateGradients = (name) => {
  const hash = getHash(name);       // Deterministic hash from string
  const h1 = hash % 360;            // Primary hue (0-359)
  const h2 = (h1 + 120) % 360;     // Complementary hue (120° apart)
  return `linear-gradient(135deg, hsl(${h1},75%,45%), hsl(${h2},85%,60%))`;
};
```

### MessageInput — Typing Indicator Logic
```javascript
const handleChange = (e) => {
  setText(e.target.value);
  
  // Start typing indicator
  if (!isTyping) {
    setIsTyping(true);
    onTyping(true);   // socket.emit('typing', { isTyping: true })
  }
  
  // Reset 3-second idle timeout
  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    onTyping(false);  // socket.emit('typing', { isTyping: false })
  }, 3000);
};
```
**Why 3 seconds?** Industry standard for typing indicator timeout. WhatsApp/Slack use similar durations.

---

## 8. Socket.IO — Real-Time Communication

### Why Socket.IO Over Raw WebSockets?
1. **Auto-reconnection**: Configurable retry attempts and delay
2. **Room Management**: Built-in `socket.join(room)` / `socket.leave(room)`
3. **Transport Fallback**: WebSocket → HTTP long-polling if WebSocket fails
4. **Event-Based API**: Named events (`emit('chatMessage')`) vs raw data frames
5. **Acknowledgements**: Optional callback-based message delivery confirmation
6. **Broadcasting**: `io.to(room).emit()` sends to all in a room

### Connection Configuration
```javascript
// Client-side
const socketInstance = io(socketUrl, {
  transports: ['websocket', 'polling'],  // Try WebSocket first
  autoConnect: true,
  reconnectionAttempts: 5,               // Max 5 retries
  reconnectionDelay: 1000               // 1 second between retries
});
```

### Active Users Management (In-Memory)
```javascript
const activeRoomUsers = {};
// { "room123": [{ socketId: "abc", userId: "user1", username: "John" }] }
```

**Why in-memory?** Online presence is ephemeral — if the server restarts, all connections reset anyway. For production with multiple server instances, you'd use **Redis** for shared state.

### Disconnect Cleanup
```javascript
const removeUserFromAllRooms = (socket, io) => {
  for (const roomId in activeRoomUsers) {
    // Filter out the disconnected socket
    activeRoomUsers[roomId] = activeRoomUsers[roomId].filter(
      user => user.socketId !== socketId
    );
    
    // Notify remaining room members
    io.to(roomId).emit('onlineUsers', activeRoomUsers[roomId]);
    
    // Clean up empty room entries
    if (activeRoomUsers[roomId].length === 0) {
      delete activeRoomUsers[roomId];
    }
  }
};
```

---

## 9. Authentication Flow (JWT)

### Registration Flow
```
Client                    Server                    MongoDB
  │                         │                          │
  │ POST /api/auth/register │                          │
  │ { username, email, pw } │                          │
  │────────────────────────>│                          │
  │                         │ Check unique email       │
  │                         │─────────────────────────>│
  │                         │ Check unique username    │
  │                         │─────────────────────────>│
  │                         │ bcrypt.genSalt(10)       │
  │                         │ bcrypt.hash(pw, salt)    │
  │                         │ Save hashed user         │
  │                         │─────────────────────────>│
  │                         │ jwt.sign(payload, secret,│
  │                         │   { expiresIn: '7d' })   │
  │     { token, user }     │                          │
  │<────────────────────────│                          │
  │ localStorage.set(token) │                          │
```

### Login Flow
```
Client                    Server                    MongoDB
  │ POST /api/auth/login    │                          │
  │ { usernameOrEmail, pw } │                          │
  │────────────────────────>│                          │
  │                         │ Find by email OR username│
  │                         │ (using $or operator)     │
  │                         │─────────────────────────>│
  │                         │ bcrypt.compare(pw, hash) │
  │                         │ jwt.sign(payload)        │
  │     { token, user }     │                          │
  │<────────────────────────│                          │
  │ localStorage.set(token) │                          │
```

### Token Verification (Every Page Load)
```javascript
// AuthContext.jsx — runs once on mount
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) { setLoading(false); return; }
  
  api.get('/api/auth/verify')  // Axios interceptor attaches Bearer token
    .then(res => setUser(res.data))
    .catch(() => {
      localStorage.removeItem('token');  // Invalid/expired token
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);
```

### Axios Interceptor — Automatic Token Attachment
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```
**Why an interceptor?** Every authenticated API call needs the token. Instead of manually adding it to each request, the interceptor does it automatically.

---

## 10. Key Features Explained

### Feature 1: Real-Time Messaging
- Uses Socket.IO `emit()` and `on()` for instant delivery
- Messages are **persisted to MongoDB** before broadcasting
- All clients in the room receive the message simultaneously via `io.to(roomId).emit('message', ...)`

### Feature 2: Private Rooms with Access Keys
- Rooms can be marked `isPrivate: true` with an `accessKey`
- Non-members see a "Join Group" card with access key input
- Server validates the access key before adding user to `members[]`

### Feature 3: Cursor-Based Pagination
```javascript
// Instead of offset-based (page 1, page 2...)
// We use timestamp cursor:
const query = { room: roomId };
if (before) {
  query.timestamp = { $lt: new Date(before) };
}
const messages = await Message.find(query)
  .sort({ timestamp: -1 })
  .limit(50);
```
**Why cursor-based over offset-based?**
- Offset pagination breaks when new messages arrive (shifting pages)
- Cursor pagination is stable: "give me 50 messages before this timestamp"
- More efficient with compound index `{ room: 1, timestamp: -1 }`

### Feature 4: Typing Indicators
- Client emits `typing` event with `{ username, isTyping: true/false }`
- 3-second debounce timeout auto-clears typing state
- Server relays to other room members via `socket.to(roomId).emit('typing', ...)`
- Supports multiple simultaneous typists: "Alice and Bob are typing"

### Feature 5: Message Reactions
- Toggle behavior: click same emoji twice → removes reaction
- Click different emoji → replaces previous reaction
- One reaction per user per message
- Stored as embedded array in Message document
- Updates broadcast to all room members via `reactionUpdate` event

### Feature 6: Online Users Tracking
- In-memory `activeRoomUsers` map
- Handles duplicate connections (user refreshes → updates socketId)
- Auto-cleanup on disconnect via `removeUserFromAllRooms()`
- Real-time updates via `onlineUsers` event

### Feature 7: System Messages
- Join/Leave events displayed inline as system messages
- Leave messages are **persisted** to MongoDB (survives refresh)
- Join messages are **client-side only** (ephemeral)
- Visual distinction with centered, muted styling

---

## 11. API Endpoints Reference

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login (email or username) |
| GET | `/api/auth/verify` | Private | Verify token, return user data |

### Room Routes (`/api/rooms`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/rooms` | Private | Create a new room |
| GET | `/api/rooms` | Private | List all rooms |
| GET | `/api/rooms/:id` | Private | Get single room details |
| POST | `/api/rooms/:id/join` | Private | Join a room (validates access key) |
| POST | `/api/rooms/:id/leave` | Private | Leave a room + broadcast notification |
| GET | `/api/rooms/:id/messages` | Private | Get paginated message history |

### Query Parameters for Message History
- `limit` (default: 50) — Number of messages to return
- `before` (ISO timestamp) — Cursor for pagination

---

## 12. State Management Strategy

### Context API (Not Redux)

**AuthContext** — Global authentication state
```javascript
// Provided values:
{ user, loading, error, login, register, logout, isAuthenticated }
```

**SocketContext** — Global socket connection
```javascript
// Provided values:
{ socket, isConnected }
```

### Local Component State (in ChatRoom)
```javascript
const [rooms, setRooms] = useState([]);           // All available rooms
const [activeRoom, setActiveRoom] = useState(null); // Currently selected room
const [messages, setMessages] = useState([]);       // Messages for active room
const [onlineUsers, setOnlineUsers] = useState([]); // Users in active room
const [typingUsers, setTypingUsers] = useState([]); // Currently typing users
const [isCreateOpen, setIsCreateOpen] = useState(false);  // Modal state
const [hasMoreOlder, setHasMoreOlder] = useState(true);   // Pagination flag
const [sidebarOpen, setSidebarOpen] = useState(true);     // Mobile sidebar
const [showLeaveModal, setShowLeaveModal] = useState(false);
```

### Why Context API Over Redux?
- **App complexity**: Only 2 global concerns (auth + socket). Redux overkill.
- **No prop drilling beyond 2 levels**: Context solves this directly.
- **Fewer files & boilerplate**: No actions, reducers, store configuration.
- **Performance**: With only 2 contexts, re-render scope is manageable.

### If the app grew, I would consider:
- **Redux Toolkit** or **Zustand** for more complex global state
- **React Query / TanStack Query** for server state caching
- **Socket middleware** in Redux for cleaner event handling

---

## 13. Design Patterns Used

### 1. Provider Pattern (React Context)
```
AuthProvider wraps the entire app → any component can useContext(AuthContext)
SocketProvider wraps the app → any component can useContext(SocketContext)
```

### 2. Middleware Pattern (Express)
```
Request → cors() → json() → req.io injection → route handler → error handler
Protected routes: Request → auth middleware → route handler
```

### 3. Observer/Pub-Sub Pattern (Socket.IO)
```
socket.on('event', callback)   // Subscribe
socket.emit('event', data)     // Publish
io.to(room).emit('event')      // Broadcast to subscribers
```

### 4. Interceptor Pattern (Axios)
```
Every outgoing request → interceptor adds Authorization header automatically
```

### 5. Repository Pattern (Mongoose Models)
```
User.findOne(), Room.findById(), Message.find() — data access abstracted through models
```

### 6. Component Composition (React)
```
ChatRoom orchestrates MessageList, MessageInput, RoomList, OnlineUsers
Each is a focused, reusable component with single responsibility
```

### 7. Guard Pattern (Route Protection)
```
ProtectedRoute → checks auth → renders children OR redirects
PublicRoute → checks auth → renders children OR redirects to /chat
```

---

## 14. Security Considerations

### What's Implemented ✅
1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Authentication**: Stateless tokens with 7-day expiry
3. **Input Validation**: Server-side validation on all models
4. **Protected Routes**: Auth middleware on all private endpoints
5. **CORS Configuration**: Enabled via `cors()` middleware
6. **Environment Variables**: Secrets stored in `.env`, not hardcoded

### What Could Be Improved 🔧
1. **Rate Limiting**: Add `express-rate-limit` to prevent brute-force attacks
2. **Input Sanitization**: Use `xss-clean` or `DOMPurify` to prevent XSS in messages
3. **Helmet.js**: Add security headers (X-XSS-Protection, Content-Security-Policy)
4. **CORS Restriction**: Change `origin: '*'` to specific frontend domain in production
5. **Access Key Hashing**: Hash room access keys like passwords (currently plain text)
6. **Socket Authentication**: Validate JWT in socket handshake middleware
7. **HTTPS**: Enforce TLS in production
8. **Password Reset**: Currently not implemented
9. **Account Lockout**: No protection against failed login attempts
10. **MongoDB Injection**: Although Mongoose helps, explicit sanitization would be safer

### How to Add Socket Authentication (Interview Discussion Point)
```javascript
// Server-side socket middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

---

## 15. Performance Optimizations

### Implemented ✅
1. **Database Index**: Compound index `{ room: 1, timestamp: -1 }` on Messages — O(log n) query vs O(n) scan
2. **Cursor-Based Pagination**: Only loads 50 messages at a time, stable under concurrent writes
3. **Denormalized `senderUsername`**: Avoids `.populate('sender')` on every message fetch
4. **Efficient Socket Cleanup**: `removeUserFromAllRooms` iterates only the rooms map
5. **Debounced Typing**: 3-second timeout prevents excessive typing events
6. **React Key Strategy**: Using `msg._id || index` for efficient list reconciliation

### Could Be Improved 🔧
1. **Virtual Scrolling**: For rooms with 10k+ messages, use `react-window` or `react-virtualized`
2. **Message Batching**: Buffer rapid messages and send in batches
3. **Redis Pub/Sub**: For horizontal scaling with multiple server instances
4. **CDN for Static Assets**: Serve frontend via CloudFront/Vercel Edge
5. **Database Caching**: Cache frequently accessed rooms list
6. **Lazy Loading Components**: Code-split Chat vs Auth components
7. **Connection Pooling**: Mongoose default pool size (5) may need tuning
8. **Compression**: Add `compression` middleware for HTTP responses

---

## 16. Challenges Faced & Solutions

### Challenge 1: Layout Breaking When Messages Overflow
**Problem**: Messages pushed the navbar and sidebar out of view.  
**Solution**: Used CSS `flex` layout with `overflow: hidden` on the container and `overflow-y: auto` on `message-list` with explicit `min-height: 0` on flex children. The key was understanding that flex items won't shrink past their content size by default.

### Challenge 2: Socket Event Listener Leaks
**Problem**: Switching rooms accumulated event listeners (messages duplicated).  
**Solution**: Used `useEffect` cleanup to `socket.off()` all listeners and `emit('leaveRoom')` when switching rooms. The dependency array `[activeRoomId, socketId]` ensures proper cleanup.

### Challenge 3: Typing Indicator Race Conditions
**Problem**: Typing indicator sometimes stayed after user stopped typing.  
**Solution**: Implemented debounce with `useRef` for timeout, clear on message send, and cleanup on component unmount.

### Challenge 4: Duplicate Online Users
**Problem**: User refreshing page appeared twice in online list.  
**Solution**: Check `userExists` before pushing to `activeRoomUsers`; if user already exists, just update their `socketId`.

### Challenge 5: Room Sidebar Not Scrolling
**Problem**: Room list didn't scroll when too many rooms.  
**Solution**: Set `overflow-y: auto`, `min-height: 0` on the flex container, and explicit height constraints. The CSS flex box model requires `min-height: 0` to allow shrinking.

### Challenge 6: REST + WebSocket Coordination
**Problem**: Leaving a room via REST API needed to also notify WebSocket clients.  
**Solution**: Injected `io` into Express requests via middleware (`req.io = io`), allowing REST handlers to emit Socket.IO events.

---

## 17. Future Improvements / Scalability

### Feature Roadmap
1. **Direct Messages (DMs)**: 1-on-1 private conversations
2. **File/Image Sharing**: Upload to S3/Cloudinary, share URL in message
3. **Message Search**: Full-text search across messages (MongoDB text index)
4. **Read Receipts**: Track which users have seen each message
5. **User Profiles**: Avatar upload, bio, status
6. **Push Notifications**: Browser notifications for new messages
7. **Message Editing/Deletion**: Edit sent messages within time window
8. **Thread Replies**: Reply to specific messages in a thread
9. **Admin Controls**: Room admin can kick/ban users, manage permissions
10. **End-to-End Encryption**: For private rooms

### Scalability Architecture
```
                    Load Balancer (Nginx)
                    ┌──────┴──────┐
                    │             │
              Server 1       Server 2
              (Node.js)      (Node.js)
                    │             │
                    └──────┬──────┘
                    Redis Pub/Sub
                    (Shared socket state)
                           │
                    MongoDB Replica Set
                    (Primary + Secondary)
```

### Key Scalability Steps:
1. **Redis Adapter for Socket.IO**: `@socket.io/redis-adapter` for multi-server socket state
2. **MongoDB Sharding**: Shard messages collection by `room` field
3. **CDN + Static Hosting**: Serve React bundle via CDN (Vercel, CloudFront)
4. **Horizontal Pod Autoscaling**: Kubernetes or ECS for container orchestration
5. **Message Queue**: RabbitMQ/Kafka for high-throughput message processing
6. **Database Connection Pooling**: Tune Mongoose pool size per server

---

## 18. Common Interview Questions & Answers

### Architecture & Design

**Q: Why did you choose MERN stack for this project?**
> MongoDB's document model naturally fits chat data (messages with embedded reactions). Express + Node.js handles concurrent WebSocket connections efficiently with its event-driven, non-blocking I/O model. React's component model and state management make building complex interactive UIs manageable.

**Q: How does real-time communication work in your app?**
> I use Socket.IO, which establishes a persistent WebSocket connection between client and server. When a user sends a message, the client emits a `chatMessage` event. The server saves it to MongoDB, then broadcasts it to all clients in that room using `io.to(roomId).emit('message', ...)`. This happens in milliseconds without polling.

**Q: Why Socket.IO instead of raw WebSockets?**
> Socket.IO provides automatic reconnection (5 retries at 1-second intervals), transport fallback (polling if WebSocket fails), built-in room management (`join`/`leave`), and a convenient event-based API. Building all of this from scratch with raw WebSockets would be significant additional work.

**Q: How would you scale this to support 1 million users?**
> The main bottleneck is the in-memory `activeRoomUsers` map. I'd:
> 1. Add Redis as a shared state store and use `@socket.io/redis-adapter` for cross-server socket communication
> 2. Deploy multiple Node.js instances behind a load balancer with sticky sessions
> 3. Shard MongoDB by room ID for write distribution
> 4. Add a CDN for the React frontend
> 5. Implement message queuing (Kafka) for guaranteed delivery under high load

**Q: Explain your database design decisions.**
> I used three collections: Users, Rooms, and Messages. Messages have a compound index on `{room, timestamp}` for efficient cursor-based pagination. I denormalized `senderUsername` in Messages to avoid expensive `populate()` calls on every message fetch — a calculated trade-off favoring read performance over strict normalization, since usernames rarely change.

### Authentication

**Q: How does your authentication work?**
> I use JWT (JSON Web Tokens). On register/login, the server generates a token containing the user's `id`, `username`, and `email`, signed with a secret key, with a 7-day expiry. The client stores this in `localStorage` and sends it as a `Bearer` token in the `Authorization` header on every request. The auth middleware verifies the token and attaches the decoded payload to `req.user`.

**Q: Why JWT over session-based auth?**
> JWT is stateless — the server doesn't need to maintain session storage. This makes horizontal scaling easier: any server can verify the token without checking a shared session store. It also works well with single-page applications and API-first architectures.

**Q: What are the security risks of storing JWT in localStorage?**
> localStorage is vulnerable to XSS attacks — if an attacker injects JavaScript, they can read the token. A more secure approach would be:
> 1. Store the token in an **HttpOnly cookie** (not accessible via JavaScript)
> 2. Add **CSRF protection** (double submit cookie or SameSite attribute)
> 3. Use short-lived access tokens with **refresh tokens**
> For this project's scope, localStorage was acceptable, but I'm aware of the trade-offs.

**Q: How does the Axios interceptor work?**
> I configured a request interceptor on the Axios instance that runs before every outgoing HTTP request. It checks `localStorage` for a token and, if found, automatically adds it to the `Authorization` header as `Bearer <token>`. This eliminates the need to manually pass the token in every API call.

### Socket.IO

**Q: How do you handle users disconnecting unexpectedly?**
> Socket.IO fires a `disconnect` event when a connection drops. My `removeUserFromAllRooms()` function iterates through all rooms in the `activeRoomUsers` map, removes the disconnected socket, broadcasts the updated online list to remaining users, and cleans up empty room entries to prevent memory leaks.

**Q: How does the typing indicator work technically?**
> When a user types in the input field, the `handleChange` function emits a `typing` event with `isTyping: true`. A 3-second debounce timeout is set — if the user stops typing for 3 seconds, it emits `isTyping: false`. The server relays this to other room members via `socket.to(roomId).emit()`. The `TypingIndicator` component renders text like "Alice is typing" or "Alice and Bob are typing" based on the `typingUsers` array.

**Q: What happens if two people send a message at exactly the same time?**
> Socket.IO and Node.js handle this gracefully. Each `chatMessage` event is processed sequentially in Node's event loop. Both messages get saved to MongoDB with their respective timestamps, and both are broadcast to the room. The order depends on which event Node.js processes first, but both messages will appear for all users.

**Q: How do you prevent duplicate socket listings?**
> In the `joinRoom` handler, I check `activeRoomUsers[roomId].some(u => u.userId === userId)` before adding. If the user already exists (e.g., they refreshed the page), I update their `socketId` instead of adding a duplicate entry.

### React / Frontend

**Q: Why Context API instead of Redux?**
> For this app, I only have two global concerns: authentication state and the socket connection. Redux would add significant boilerplate (actions, reducers, store setup) for minimal benefit. Context API handles these two cases cleanly. If the app grew significantly — say, with notifications, user preferences, complex caching — I'd consider Redux Toolkit or Zustand.

**Q: How do you handle message pagination?**
> I use cursor-based pagination. When the user clicks "Load older messages," I take the timestamp of the oldest message currently displayed and pass it as a `before` query parameter: `GET /api/rooms/:id/messages?before=2024-01-15T10:30:00Z&limit=50`. The server queries messages with `timestamp < before`, sorted descending, limited to 50. On the client, I prepend these to the existing messages array.

**Q: How does auto-scrolling work?**
> I place an invisible `<div ref={bottomRef} />` at the bottom of the message list. In a `useEffect` that depends on the `messages` array, I call `bottomRef.current.scrollIntoView({ behavior: 'smooth' })`. This triggers smooth scrolling to the bottom whenever new messages arrive.

**Q: How do message reactions work?**
> On hover, a reaction picker appears with 6 emoji options. Clicking an emoji calls `socket.emit('messageReaction', { messageId, emoji })`. The server uses toggle logic: if the user already reacted with that emoji, it removes it; if they reacted with a different emoji, it replaces it; if they haven't reacted, it adds a new reaction. The server then broadcasts the updated reactions array to all room members.

### Database

**Q: Explain the compound index on Messages.**
> `MessageSchema.index({ room: 1, timestamp: -1 })` creates a B-tree index that first sorts by room ID, then by timestamp in descending order within each room. This optimizes our most frequent query: "get the latest N messages for room X, ordered by time." Without this index, MongoDB would do a full collection scan — O(n). With it, the query is O(log n).

**Q: Why denormalize `senderUsername` in Messages?**
> Loading a chat room fetches 50 messages at once. If we used `populate('sender')`, that's 50 additional database lookups (or one `$in` query). By storing `senderUsername` directly, we eliminate this join entirely. The trade-off is data duplication — if a user changes their username, old messages show the previous name. For a chat app, this is acceptable and common (WhatsApp, Slack both do this).

---

## 19. Code Snippets to Explain in Interview

### 1. The `req.io` Middleware Pattern
```javascript
// server.js
app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes/rooms.js (Leave Room handler)
router.post('/:id/leave', auth, async (req, res) => {
  // ... update database ...
  
  // Broadcast via WebSocket from a REST handler
  req.io.to(req.params.id).emit('userLeftChat', {
    userId: req.user.id,
    username: req.user.username,
    message: `${req.user.username} left the chat`
  });
});
```
**Explain**: "This pattern bridges REST and WebSocket. When a user leaves via an HTTP POST, we need real-time notification. By injecting the Socket.IO instance into Express requests, REST handlers can broadcast events."

### 2. Socket Event Cleanup in useEffect
```javascript
useEffect(() => {
  socket.on('message', handleNewMessage);
  socket.on('loadHistory', handleLoadHistory);
  // ... more listeners
  
  return () => {
    socket.emit('leaveRoom', { roomId, username });
    socket.off('message', handleNewMessage);
    socket.off('loadHistory', handleLoadHistory);
    // ... remove all listeners
  };
}, [activeRoomId]);
```
**Explain**: "React's cleanup function runs when the dependency changes or component unmounts. Without removing listeners, switching rooms would cause previous room's listeners to still fire, leading to messages appearing in the wrong room. This is a memory leak prevention pattern."

### 3. Login with $or Operator
```javascript
let user = await User.findOne({
  $or: [
    { email: usernameOrEmail.toLowerCase() },
    { username: usernameOrEmail }
  ]
});
```
**Explain**: "MongoDB's `$or` operator lets users log in with either their email or username using a single query. The email is lowercased for case-insensitive matching, while the username comparison is case-sensitive by design."

### 4. Reaction Toggle Logic
```javascript
const existingIndex = message.reactions.findIndex(r => r.username === username);

if (existingIndex > -1) {
  if (message.reactions[existingIndex].reaction === reaction) {
    message.reactions.splice(existingIndex, 1);    // Remove (toggle off)
  } else {
    message.reactions[existingIndex].reaction = reaction; // Update emoji
  }
} else {
  message.reactions.push({ username, reaction });  // Add new
}
```
**Explain**: "Three-way logic: same emoji = remove, different emoji = replace, no reaction = add. This ensures one reaction per user per message with toggle behavior."

---

## 20. How to Run the Project

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup
```bash
cd chat-app-backend
npm install
# Create .env file with:
# PORT=5080
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=your-secret-key
npm run dev   # Starts with nodemon on port 5080
```

### Frontend Setup
```bash
cd chat-app-frontend
npm install
# Create .env file with:
# VITE_APP_API_URL=http://localhost:5080
# VITE_APP_SOCKET_URL=http://localhost:5080
npm run dev   # Starts Vite dev server on port 5173
```

### Testing the App
1. Open `http://localhost:5173` in two browser tabs
2. Register two different users
3. Create a room with one user
4. Join the room with the other user
5. Send messages, observe real-time delivery
6. Test typing indicator, reactions, leave group

---

## 21. Production Deployment & DevOps

Deploying a real-time full-stack chat application presents unique DevOps and architectural challenges. Below is a comprehensive guide to how TalkHub is deployed and the production-level problems solved during the process.

### 🚀 Architectural Deployment Choices

| Tier | Platform | Type | Rationale & Trade-offs |
|---|---|---|---|
| **Frontend** | **Vercel** | Static Site Hosting (Vite CDN) | Ultra-fast load times globally via Edge Network, native SPA routing configuration, and automatic Git integration. |
| **Backend** | **Render** | Persistent Web Service | **Critical Choice:** Socket.IO requires persistent WebSocket connections. Serverless platforms (like Vercel serverless functions) kill connections after function execution, making them unsuitable for live chat connections. Render's Web Services tier provides standard long-running Node processes. |
| **Database** | **MongoDB Atlas** | Managed Cloud DB (SaaS) | Offloads database clustering, replication, and physical backups to a fully managed cloud service. |

---

### ⚙️ Step-by-Step Production Configuration

#### 1. Handling SPA Client-Side Routing on Vercel
Since React is a Single Page Application (SPA), all routes (e.g., `/chat`, `/login`) are managed client-side by React Router. When a user refreshes the page on Vercel, the server looks for a physical directory/file corresponding to that route and throws a `404 Not Found` error.
* **Solution**: Create a `vercel.json` file in the frontend root to rewrite all requests back to `index.html`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 2. Restricting CORS for Socket.IO & Express (Security)
In development, CORS was set to `origin: '*'` (allow all) for developer speed. In production, this opens a severe security vulnerability.
* **Solution**: Configure the backend's `server.js` to dynamically allow origin lists via `process.env.CLIENT_URL`:
```javascript
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Applied to Express CORS & Socket.IO
```
* On Render, the `CLIENT_URL` is set to the live frontend domain (e.g. `https://talk-hub-sepia.vercel.app`), ensuring that only your verified UI can connect.

---

### 🛠️ Common Deployment Gotchas & How We Solved Them

#### 1. The Git-Tracked `node_modules` Nightmare (Linux vs. Windows Binaries)
* **The Problem**: If `node_modules` folders are mistakenly committed to Git, deploying on Vercel will trigger a build error:
  `sh: line 1: .../node_modules/.bin/vite: Permission denied`
  This happens because Windows Git ignores Linux executable bits, and trying to run Windows-compiled binaries on Vercel's Linux servers throws permission/mismatch errors.
* **The Fix**: 
  1. Add a comprehensive `.gitignore` in the workspace root to permanently ignore `node_modules/`.
  2. Untrack the folder from the git index without deleting local files: `git rm -r --cached chat-app-frontend/node_modules chat-app-backend/node_modules`.
  3. Commit and push the clean repo to force Vercel to install its own compatible binaries during build.

#### 2. The Double `/api/api` Subpath 404 Error
* **The Problem**: Axios API requests were failing with `404 Not Found`. Looking closely at the request URL revealed it was hitting `https://...onrender.com/api/api/auth/register`. 
* **The Cause**: The frontend code (e.g., `api.post('/api/auth/register')`) already starts with the `/api` subpath. Configuring the environment variable `VITE_APP_API_URL` to `https://...onrender.com/api` caused Axios to concatenate them, duplicating `/api/api`.
* **The Fix**: Set `VITE_APP_API_URL` to only the root domain `https://...onrender.com` (no trailing `/api` or `/`).

#### 3. The `%20https` WebSocket Connection Protocol Mismatch
* **The Problem**: The console threw: `WebSocket connection to 'wss://%20https/socket.io/... failed: websocket error`.
* **The Cause**: In the Vercel dashboard, when copying/pasting the environment variable `VITE_APP_SOCKET_URL`, a leading space was accidentally introduced (e.g., `" https://..."`). `%20` is the URL encoding for a space, which caused the browser client to fail parsing the URL and try resolving it relatively.
* **The Fix**: Removed the leading space in Vercel's configuration panel and triggered a **Redeploy**.

#### 4. The Render Free Tier "Cold Start" Delays
* **The Problem**: The app sometimes fails to register/login or feels completely unresponsive on the first visit.
* **The Cause**: Render's free tier automatically suspends web service containers after 15 minutes of zero traffic. When a new user hits the frontend and triggers an API request, Render takes about **50-90 seconds** to spin up the backend container and connect to MongoDB.
* **The Fix**: In a production environment, this is solved by upgrading to a paid tier (which keeps the service warm 24/7) or implementing an active cron job to ping the backend health endpoint `/` every 10 minutes.

---

## 📝 Quick Reference Card (Print This)

```
PROJECT:    TalkHub — Real-Time Group Chat (MERN + Socket.IO)
BACKEND:    Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, bcrypt
FRONTEND:   React 18, Vite, React Router v6, Axios, Socket.IO Client, CSS
DATABASE:   3 Collections: Users, Rooms, Messages
AUTH:       JWT in localStorage → Axios interceptor → Bearer header
REALTIME:   Socket.IO rooms, 7 event types, in-memory user tracking
FEATURES:   Auth, Rooms (public/private), Messages, Typing, Reactions, Pagination
PATTERNS:   Provider, Middleware, Observer, Interceptor, Repository, Guard
INDEX:      { room: 1, timestamp: -1 } compound index on Messages
PAGINATION: Cursor-based (timestamp), not offset-based
FILES:      ~20 source files, ~475 lines in main component
```

---

## 22. Mobile Application (React Native) Development

To extend the TalkHub ecosystem beyond browsers, we built a cross-platform mobile application using **React Native (CLI)**. The mobile app interacts with the exact same Node.js + Express backend and MongoDB database, sharing the core WebSocket event structure.

### 📱 Mobile Tech Stack
* **Framework**: React Native 0.86.0 (running on React 19)
* **Navigation**: `@react-navigation/native` & `@react-navigation/native-stack`
* **Network & REST**: `axios` (with request interceptors for token attachment)
* **Real-time Engine**: `socket.io-client`
* **Storage**: `@react-native-async-storage/async-storage` (replaces browser's `localStorage` for JWT persistence)
* **Safe Area Handling**: `react-native-safe-area-context`
* **Screens Optimization**: `react-native-screens`

---

### 🛠️ Key Mobile Challenges & Technical Solutions

#### 1. Keyboard Overlap in Chat Interface
* **The Problem**: While typing in `ChatScreen`, the Android keyboard would overlap the message input box, completely hiding what the user was typing.
* **The Cause**: Standard Android behavior resizing conflicts with React Native's `KeyboardAvoidingView` when set to `behavior="height"`.
* **The Solution**: 
  1. Updated the screen wrapper to `KeyboardAvoidingView` with `behavior="padding"` on both iOS and Android.
  2. Applied a specific `keyboardVerticalOffset={100}` on Android to account for the React Navigation stack header height, pushing the input bar perfectly above the active keyboard.

#### 2. Screen Overlapping with Android Status Bar (Notch/Battery Info)
* **The Problem**: When navigating to screens with custom headers (`headerShown: false`), the layout shifted completely to the top edge, causing elements to hide behind the system clock, battery, and camera notch.
* **The Solution**: 
  1. Integrated the root app under a unified `<SafeAreaProvider>` in [App.js](file:///d:/TalkHub/mobile/App.js).
  2. Wrapped individual custom-header screens ([LoginScreen.js](file:///d:/TalkHub/mobile/src/screens/LoginScreen.js), [RegisterScreen.js](file:///d:/TalkHub/mobile/src/screens/RegisterScreen.js), etc.) in a `SafeAreaView` from `'react-native-safe-area-context'`.
  3. Structured [RoomListScreen.js](file:///d:/TalkHub/mobile/src/screens/RoomListScreen.js) with a sub-safe-area wrapper:
     ```javascript
     <View style={styles.container}>
       <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
         {/* Green Header */}
       </SafeAreaView>
       {/* Rest of the screen (Gray background list) */}
     </View>
     ```
     This prevents a "split color" status bar and ensures the system battery/clock area blends perfectly with the deep green navigation bar.

#### 3. Local Networking Gotchas (`localhost` on Physical USB Devices)
* **The Problem**: While testing the app on a physical device, requests to `http://localhost:5080` (or Android emulator's `http://10.0.2.2:5080`) failed and hung indefinitely on the loading state.
* **The Solution**: 
  1. For local testing, we ran **ADB reverse port-forwarding**:
     ```bash
     adb reverse tcp:5080 tcp:5080
     ```
     This maps the phone's port `5080` directly to the PC's port `5080` over the USB cable, allowing `localhost:5080` requests from the phone to succeed.
  2. For the production APK build, we replaced `localhost` with the live Render WebSocket/REST URL: `https://chat-app-backend-kmr4.onrender.com`.

#### 4. React Native 0.86.0 Compiler Failures (`ChoreographerCompat`)
* **The Problem**: Building the application failed during Kotlin compilation with `Unresolved reference 'ChoreographerCompat'` inside `react-native-screens`.
* **The Cause**: React Native 0.86.0 removed deprecated legacy architectural classes (`ChoreographerCompat`), causing older versions of `react-native-screens` to fail builds.
* **The Solution**: Upgraded `react-native-screens` to version `^4.25.2` which is fully refactored to support React Native 0.86.0 builds natively.

---

### 📦 Android Build & Compilation Commands

#### To Compile and Install on a USB-Connected Device:
1. Ensure USB debugging is enabled and authenticated (`adb devices` shows active device).
2. Establish port forwarding (if running local backend):
   ```bash
   adb reverse tcp:5080 tcp:5080
   ```
3. Run the development build command:
   ```bash
   npm run android
   ```

#### To Generate a Standalone Debug APK:
1. Navigate to the `android` subfolder:
   ```bash
   cd android
   ```
2. Build the debug assembly:
   ```bash
   .\gradlew.bat assembleDebug
   ```
3. Locate the completed binary for distribution:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

> **Last Updated**: June 2026  
> **Author**: Ravent Dahiya  
> **Tip**: Practice explaining the architecture diagram and data flow verbally. Interviewers love hearing how data moves through your system end-to-end.
