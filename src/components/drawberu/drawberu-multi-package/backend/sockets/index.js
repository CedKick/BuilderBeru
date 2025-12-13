// 🔌 Socket.io Initialization
// Par Kaisel pour BuilderBeru 😈

const { Server } = require('socket.io');
const { initDrawBeruSockets, getRoomsStats } = require('./drawberu');

let io = null;

const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });
  
  console.log('🔌 Socket.io initialisé');
  
  initDrawBeruSockets(io);
  
  io.on('connection', (socket) => {
    console.log('🌐 Connexion globale: ' + socket.id);
  });
  
  return io;
};

const getIO = () => io;

module.exports = {
  initSocketIO,
  getIO,
  getRoomsStats,
};
