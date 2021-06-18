const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./public/utils/messages');
const{
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./public/utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Hablemos de Todo Bot';

// Ejecutar cuando el cliente se conecta
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Bienvenido usuario actual
      socket.emit('message', formatMessage(botName, 'Bienbenido a Hablemos de Todo'));
  
      // Emision cuando un usuario se coencta
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} se ha conectado al chat`)
        );
  
      // Enviando inf. salas y usuarios
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
  
    // Mensajes del chat
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
  
    // Se ejecuta cuando el cliente se desconecta
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
  
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} ha dejado el Chat`)
        );
  
        // Enviando inf. de sala y usuarios
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
  

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Setver conectado en el puerto: ${PORT}`)); 