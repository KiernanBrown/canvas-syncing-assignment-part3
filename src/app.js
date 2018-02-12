const http = require('http');
const socketio = require('socket.io');

const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const drawObjects = {};

const handler = (req, res) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) {
      throw err;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
};

const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);

io.on('connection', (socket) => {
  socket.join('room1');
  socket.emit('setObjects', drawObjects);

  socket.on('squareCreated', (data) => {
    const square = data;
    square.lastUpdate = new Date().getTime();
    drawObjects[square.user] = square;

    io.sockets.in('room1').emit('updatedObjects', square);
  });

  socket.on('squareMoved', (data) => {
    // Update the square's lastUpdate and put it in our drawObjects
    const square = data;
    square.lastUpdate = new Date().getTime();
    drawObjects[square.user] = square;

    // Tell the clients that we have updated the objects
    io.sockets.in('room1').emit('updatedObjects', square);
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
});

console.dir(`Listening on port ${PORT}`);
