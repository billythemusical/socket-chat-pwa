const express = require('express');
const { createServer } = require('node:http')
const { join } = require('node:path');
const { Server } = require('socket.io')
const friendlyDate = require('./friendlyDate.js')

// adding nedb to keep a record of the chat!
const Datastore = require('nedb')
const db = new Datastore({ filename: 'chat.db', autoload: true });


const app = express();
const server = createServer(app);

// Pass our HTTP server to Socket.io to create an endpoint 
// that listens for socket-related requests, i.e. <script src="/socket.io/..."
const io = new Server(server)

app.use(express.static('public'))

// Event listener once a connection is made 
// from the client, i.e. const socket = io()
io.on('connection', (socket) => {
  console.log('a user connected')

  // Send all messages from the database when a new client connects
  // Use the sort method to { time: 1 } to get the proper order
  db.find({}).sort({ time: 1 }).exec((err, docs) => {
    if (err) {
      console.error('Error retrieving messages:', err);
      return;
    }
    docs.forEach(doc => {
      doc.time = friendlyDate(doc.time);
      socket.emit('chat message', doc);
    });
  });

  socket.on('chat message', (msg) => {
    console.log('message:', msg)

    // Create a document to insert into the database
    const doc = {
      date: msg.date,
      content: msg.content,
      user: msg.user,
    };

    // Insert the message into the database
    db.insert(doc, (err, newDoc) => {
      if (err) {
        console.error('Error saving message to database:', err);
      }
    });

    // Emit the message along with the date
    io.emit('chat message', msg);
  });

  // File uploads are not stored to the database, but they are logged
  // We could log the mime type
  socket.on('file upload', (msg) => {
    console.log('a file was uploaded')

    // Create a document to insert into the database
    const doc = {
      date: msg.date,
      content: 'a file was sent',
      user: msg.user
    };

    // Insert the message into the database
    db.insert(doc, (err, newDoc) => {
      if (err) {
        console.error('Error saving message to database:', err);
      }
    });
    io.emit('file received', msg.file)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});


