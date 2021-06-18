const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Obtener el nombre de usuario y la URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Unirse a la sala
socket.emit('joinRoom', { username, room });

// Obtenniendo espacio de usuarios
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Mensaje del servidor
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll para abajo
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Enviar mensaje
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Obteniendo el texto del msj
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emitir mensaje al servidor
  socket.emit('chatMessage', msg);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Mensaje de salida del DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Agregar el nombre a la salda del DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Agregar usuarios al DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Preguntar antes del salir de la sala
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Quiere abandonar esta sala?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
