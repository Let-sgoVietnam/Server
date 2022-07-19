var socket = io();

var body = document.getElementById('body');
var chat = document.getElementById('chat');
var text = document.getElementById('text');
var send_msg = document.getElementById('send_msg');

var room = 0;
var name = '';

socket.on('connect', function() {
  console.log(socket.id);
  name = prompt('이름을 입력하세요!', '');
  if(!name) {
    name = '익명';
  }
  room = prompt('접속할 방을 입력하세요!', '');
  if(!room) {
    alert('ERR : 방이 입력되지 않음!');
  }
  socket.emit('newUser', name, room, socket.id);
  socket.emit('newclone', name, room, socket.id);
})

socket.on('update', function(text, roomtarget) {
  console.log(roomtarget);
  if(roomtarget == room)
  {
    var message = document.createElement('div');
    var node = document.createTextNode(`${text.name}: ${text.message}`);
    var className = '';

    switch(text.type) {
      case 'message':
        className = 'other';
        break;

      case 'connect':
        className = 'connect';
        break;

      case 'disconnect':
        className = 'disconnect';
        break;
    }

    message.classList.add(className);
    message.appendChild(node);
    chat.appendChild(message);
  }
});

socket.on('checkroom', function() {
  let ans = prompt('방을 찾을 수 없습니다, 새로 생성할까요?[y/]', '');
  if(ans === 'y') {
    socket.emit('createroom', {type: 'createroom'}, room);
  }
  else{
    location.reload();
  }
});


text.addEventListener("keydown", (e) => {
  if(e.key==="Enter" && e.shiftKey)
  {
    send_m();
  }
})
send_msg.addEventListener('click', send_m());

function send_m() {
  if(name && room){
  var message = text.value;
  message = message.replace(/(\n|\r\n)/g, '<br>');
  console.log(message);
  
  text.value = '';

  var msg = document.createElement('div');
  var node = document.createTextNode(message);
  msg.classList.add('me');
  msg.appendChild(node);
  chat.appendChild(msg);
  message = message.replaceAll("&gt;", ">");
  message = message.replaceAll("&lt;", "<");
  socket.emit('message', {type: 'message', message : message}, room);
  
  text.style.height = '30px';
  }
};