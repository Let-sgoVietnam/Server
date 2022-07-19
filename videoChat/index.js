'use strict';

var os = require('os');
var nodeStatic = require('node-static');
const https = require("https");
const fs = require("fs");
const options = {
  key: fs.readFileSync('/Users/sonmin/Documents/donRemove/keys/key.pem','utf-8'),
  cert: fs.readFileSync('/Users/sonmin/Documents/donRemove/keys/server.crt','utf-8'),
  ca: ""
  };
console.log(options.key);
console.log(options.cert);

const express = require('express');
const app = express();

const server = https.createServer(options, app);

const io = require('socket.io')(server);
var path = require('path')
var fileServer = new(nodeStatic.Server)();
let numClients=0;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static('./css'))
app.use('/js', express.static('./js'))
app.use('/image', express.static('./image'))
app.use('/socket.io', express.static('./socket.io'))
app.use('/button', express.static('./button'))


app.get('/', function(request, response) {
  fs.readFile('./index.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

io.on('connection', (socket)=> {
   console.log('connection...');
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
    console.log('emit log message>>'+array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    console.log('Client said: '+ message);
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
     console.log('Received request to create or join room ' + room);
     log('Received request to create or join room ' + room);
 
	 var clientsInRoom = io.sockets.adapter.rooms.get(room);
     numClients = clientsInRoom ? clientsInRoom.size : 0;

 	 console.log("before join clientsInRoom="+clientsInRoom);
	 console.log("before join numClients="+numClients);

     if (numClients === 0) {
         socket.join(room);
         log('Client ID ' + socket.id + ' created room ' + room);
         socket.emit('created', room, socket.id);
         console.log("room "+room+" has created and joined by first client");
    } else if (numClients === 1) {
         log('Client ID ' + socket.id + ' joined room ' + room);
         io.sockets.in(room).emit('join', room);
         socket.join(room);
         socket.emit('joined', room, socket.id);
         io.sockets.in(room).emit('ready');
    } else {
         socket.emit('full', room);
		 console.log("max user is execeeded!!!");
    }

     clientsInRoom = io.sockets.adapter.rooms.get(room);
     numClients = clientsInRoom ? clientsInRoom.size : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    console.log('Room ' + room + ' now has ' + numClients + ' client(s)');
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

});

server.listen(1124, () => {
  console.log('listening on :1124');
});
