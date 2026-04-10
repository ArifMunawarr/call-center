require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const { createUser, getUser, getAllUsers, deleteUser, login, getAccountByUserId, getAllAccounts } = require("./db");

// ---------------------------------------------------------------------------
// In-memory mappings (online state only — not persisted)
// ---------------------------------------------------------------------------
const userSocketMap = new Map(); // userId → socket.id
const socketUserMap = new Map(); // socket.id → userId
const activeCalls = new Map(); // channelName → { callerId, operatorId }
const operatorRoom = "operators"; // Socket.IO room for all operators

// ---------------------------------------------------------------------------
// REST – Authentication
// ---------------------------------------------------------------------------

// Login with username + password
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const account = login(username, password);
  if (!account) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  res.json(account);
});

// Verify session — check if a user_id is still valid
app.get("/api/auth/verify/:userId", (req, res) => {
  const account = getAccountByUserId(req.params.userId);
  if (!account) return res.status(404).json({ error: "Account not found" });
  res.json({
    id: account.user_id,
    username: account.username,
    name: account.name,
    role: account.role,
  });
});

// ---------------------------------------------------------------------------
// REST – User management (SQLite)
// ---------------------------------------------------------------------------

// Register / create a new user
app.post("/api/users", (req, res) => {
  const { name } = req.body;
  const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const displayName = name && name.trim() ? name.trim() : `User ${id.slice(-4)}`;
  const user = createUser(id, displayName);
  res.json(user);
});

// Login — find existing user by id
app.get("/api/users/:id", (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// List all registered users
app.get("/api/users", (_req, res) => {
  res.json(getAllUsers());
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  deleteUser(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// REST – Agora token generation
// ---------------------------------------------------------------------------
app.get("/generate-token", (req, res) => {
  const { channelName, uid } = req.query;

  if (!channelName || uid === undefined) {
    return res.status(400).json({ error: "channelName and uid are required" });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate || appId === "YOUR_AGORA_APP_ID") {
    // Return empty token when credentials are not configured – Agora SDK
    // will still work in testing mode with App ID only (no certificate).
    return res.json({ token: null, appId });
  }

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    Number(uid),
    role,
    privilegeExpireTime
  );

  return res.json({ token, appId });
});

// Utility endpoint – return APP_ID so frontends can read it at runtime
app.get("/agora-app-id", (_req, res) => {
  res.json({ appId: process.env.AGORA_APP_ID });
});

// ---------------------------------------------------------------------------
// Socket.IO signaling
// ---------------------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // -- Register user (caller) --
  socket.on("register-user", (userId) => {
    userSocketMap.set(userId, socket.id);
    socketUserMap.set(socket.id, userId);
    console.log(`✅ Registered user ${userId} → ${socket.id}`);
  });

  // -- Register operator (command center) --
  socket.on("register-operator", (operatorId) => {
    userSocketMap.set(operatorId, socket.id);
    socketUserMap.set(socket.id, operatorId);
    socket.join(operatorRoom);
    console.log(`🎧 Registered operator ${operatorId} → ${socket.id}`);
  });

  // -- Initiate call (user → all operators) --
  socket.on("call-user", ({ callerId }) => {
    // Check if any operator is online
    const room = io.sockets.adapter.rooms.get(operatorRoom);
    if (!room || room.size === 0) {
      socket.emit("call-rejected", { reason: "No operators online" });
      return;
    }

    const channelName = `call_${callerId}_${Date.now()}`;

    // Store active call (operatorId filled when accepted)
    activeCalls.set(channelName, { callerId, operatorId: null });

    // Look up caller name from DB
    const callerUser = getUser(callerId);
    const callerName = callerUser ? callerUser.name : callerId;

    // Broadcast to ALL operators
    io.to(operatorRoom).emit("incoming-call", {
      callerId,
      callerName,
      channelName,
    });

    // Let caller know the call is ringing
    socket.emit("call-ringing", { channelName });

    console.log(`📞 ${callerName} (${callerId}) calling operators on ${channelName}`);
  });

  // -- Accept call (one operator picks up) --
  socket.on("accept-call", ({ callerId, channelName }) => {
    const operatorId = socketUserMap.get(socket.id);
    const call = activeCalls.get(channelName);
    if (call) {
      call.operatorId = operatorId;
    }

    // Notify the caller
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", { channelName });
    }

    // Tell ALL other operators to remove this call from their queue
    socket.to(operatorRoom).emit("call-taken", { channelName, operatorId });

    console.log(`✅ ${operatorId} accepted call on ${channelName}`);
  });

  // -- Reject call (single operator rejects — only affects them, not the caller) --
  socket.on("reject-call", ({ callerId, channelName }) => {
    const operatorId = socketUserMap.get(socket.id);
    const call = activeCalls.get(channelName);
    if (!call) return;

    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected", { reason: "Call rejected" });
    }

    io.to(operatorRoom).emit("call-ended", { channelName });
    activeCalls.delete(channelName);

    console.log(`❌ ${operatorId} rejected ${channelName}`);
  });

  // -- End call --
  socket.on("end-call", ({ channelName, userId }) => {
    const call = activeCalls.get(channelName);
    if (call) {
      // If caller ends → notify the operator
      // If operator ends → notify the caller
      if (call.callerId === userId) {
        // Caller ended — notify operator if assigned
        if (call.operatorId) {
          const opSocketId = userSocketMap.get(call.operatorId);
          if (opSocketId) io.to(opSocketId).emit("call-ended", { channelName });
        }
        // Also remove from all operator queues (caller cancelled)
        io.to(operatorRoom).emit("call-ended", { channelName });
      } else {
        // Operator ended — notify caller
        const callerSocketId = userSocketMap.get(call.callerId);
        if (callerSocketId) {
          io.to(callerSocketId).emit("call-ended", { channelName });
        }
      }
      activeCalls.delete(channelName);
    }
    console.log(`📴 Call ended on ${channelName} by ${userId}`);
  });

  // -- Disconnect --
  socket.on("disconnect", () => {
    const userId = socketUserMap.get(socket.id);
    if (userId) {
      // If a caller disconnects, end their pending calls
      for (const [ch, call] of activeCalls) {
        if (call.callerId === userId) {
          if (call.operatorId) {
            const opSocketId = userSocketMap.get(call.operatorId);
            if (opSocketId) io.to(opSocketId).emit("call-ended", { channelName: ch });
          }
          io.to(operatorRoom).emit("call-ended", { channelName: ch });
          activeCalls.delete(ch);
        }
        // If an operator disconnects mid-call, end it for the caller
        if (call.operatorId === userId) {
          const callerSocketId = userSocketMap.get(call.callerId);
          if (callerSocketId) io.to(callerSocketId).emit("call-ended", { channelName: ch });
          activeCalls.delete(ch);
        }
      }
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
      console.log(`🔌 ${userId} disconnected`);
    }
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Call backend running on http://localhost:${PORT}`);
});
