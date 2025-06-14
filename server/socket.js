// server/socket.js
const { Server } = require('socket.io');
const db = require('./models');
const { verifyToken } = require('./helpers/jwt');

function setupSockets(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET','POST'], credentials: true }
  });

  // 1) Authenticate on handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyToken(token);
      socket.userId = payload.id;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  // 2) Handle connections and messaging
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);
    socket.join(socket.userId);

    socket.on('message:send', async ({ to, content }) => {
      try {
        // Persist
        const message = await db.Message.create({
          senderId: socket.userId,
          receiverId: to,
          content,
        });
        // Emit to recipient
        io.to(to).emit('message:receive', message);
      } catch (err) {
        console.error('❌ message:send error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
}

module.exports = setupSockets;
