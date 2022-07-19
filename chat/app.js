const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const mysql = require('mysql'); 

const app = express();

const server = http.createServer(app);
const io = socket(server);

const connect_db = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'gur061201@',
  database: 'dgswchat'
});

app.use('/css', express.static('./css'));
app.use('/js', express.static('./js'));
app.use('/json', express.static('./json'));
app.use('/picture', express.static('./picture'));

app.get('/', function(request, response) {
  fs.readFile('./html/index.html', function(err, data) {
    if(err) {
      response.send('ERR');
    } else {
      response.writeHead(200, {'Content-Type':'text/html'});
      response.write(data);
      response.end();
    }
  });
});

io.sockets.on('connection', function(socket) {
  socket.on('newUser', function(name, room, userid) {
    console.log(`${name} 님이 ${room}에 접속하였습니다.`);
    socket.name = name;
    
    connect_db.query(`SHOW TABLES FROM dgswchat WHERE Tables_in_dgswchat="room${room}"`, function (err, data) {
      
      if(data.length === 0) {
        io.to(userid).emit('checkroom', {type: 'checkroom'});
      }
      else{
        connect_db.query(`SELECT COUNT(*) as count FROM dgswchat.room${room}`, function(err, printtime) {
        let dbcount = printtime[0].count;
        for(var i = 1; i <= dbcount; i++)
        {
          connect_db.query(`SELECT msgtext, uname FROM room${room} where id=${i}`, function(err, rowdata) {
            io.to(userid).emit('update', {type: 'message', message: rowdata[0].msgtext, name: rowdata[0].uname}, room);
          });
        }
        });
      }
    });
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: `${name} 님이 ${room}에 접속하였습니다.`}, room);
  });

  socket.on('message', function(data, room) {
    data.name = socket.name;
    socket.broadcast.emit('update', data, room);
    connect_db.query(`INSERT INTO room${room} (msgtext, uname) VALUES ("${data.message}","${data.name}")`);
    console.log(data);
  });
  socket.on('k_message', function(data, room) {
    data.name = socket.name;
    socket.broadcast.emit('update', data, room);
    connect_db.query(`INSERT INTO room${room} (msgtext, uname) VALUES ("${data.message}","${data.name}")`);
    console.log(data);
  });

  socket.on('createroom', function(err, room) {
    connect_db.query(`create table room${room}(id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY, msgtext varchar(500), uname varchar(500))`);
      console.log(`create new room! [room${room}]`);
  });

  socket.on('disconnect', function(room) {
    console.log(socket.name + '님이 나가셨습니다.');

    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'}, room);
  });
})

server.listen(8080, function() {
  console.log('서버 실행 중..');
});