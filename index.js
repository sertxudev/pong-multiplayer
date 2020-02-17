const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const crypto = require('crypto');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/main.html');
});

app.use('/assets', express.static(__dirname + '/dist/assets'));

const game = {};

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('create_room', function () {
    let roomId = crypto.randomBytes(3).toString('hex');
    if (game[roomId]) return socket.emit('create_room', { error: 'Error creating the room!' });
    game[roomId] = { player1: { id: socket.id, score: 0 }, player2: { id: null, score: 0 }, roomId };
    socket.join(`room_${roomId}`);
    io.to(`room_${roomId}`).emit('game_data', game[roomId]);
  });

  socket.on('join_room', function (roomId) {
    if (!game[roomId]) return socket.emit('join_room', { error: 'Room not found!' });
    game[roomId].player2.id = socket.id;
    socket.join(`room_${roomId}`);
    io.to(`room_${roomId}`).emit('game_data', game[roomId]);
  });

  socket.on('ball_data', function (data) {
    io.to(data.player).emit("ball_data", data.ball);
  });

  socket.on('new_ball', function (data) {
    io.to(data.player).emit("new_ball");
  });
  
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
