const { Server } = require("socket.io");

let io;

// Map to store userId -> socketId
const userSocketMap = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://life-mentor-beryl.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Frontend sends userId after login
    socket.on("register", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      // Remove user from map on disconnect
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

// Send notification to a specific user by userId
const emitToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = userSocketMap[userId?.toString()];
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`📤 Emitted '${event}' to user ${userId}`);
  } else {
    console.log(`⚠️ User ${userId} not connected via socket`);
  }
};

// Send notification to all connected counsellors
const emitToCounsellor = (counsellorId, event, data) => {
  emitToUser(counsellorId, event, data);
};

const getIO = () => io;

module.exports = { initSocket, emitToUser, emitToCounsellor, getIO };