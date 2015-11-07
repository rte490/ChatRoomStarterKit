var express = require('express');
var app = express();
var path = require('path');
// static content
app.use(express.static(path.join(__dirname, './static')));
// setting up views folder and ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// serve the index page for the root route
app.get('/', function(req, res) {
  res.render('index');
})
var server = app.listen(8000);
var io = require('socket.io').listen(server);
// Insert DB config here instead of hardcoding messages and users
var messages = [];
var users = {};
// socket functionality
io.sockets.on('connection', function(socket) {
  // set up socket listeners for a particular socket when a connection is made
  // listening for event 'newUser'
  socket.on('newUser', function(data) { 
    // setting 'users[socket.id]' to equal to name provided by client/user 
    users[socket.id] = data.name;
    // emitting 'initialMessages' event and passing data in messages variable to client side
    socket.emit('initialMessages', {messages: messages});
    // setting variable message to equal name provided by client/user plus a string 
    var message = data.name + ' has joined the chat!';
    // pushing variable message to array 'messages'
    messages.push(message);
    // emitting event 'newMessage' to everyone except user who created new message to inform other users in the room that a new user has joined the room
    socket.broadcast.emit('newMessage', {message: message});
  });
  // listening for event 'messageSubmit'
  socket.on('messageSubmit', function(data) {
    // push message data to array 'messages'
    messages.push(data.message);
    // emit event 'newMessage' to everyone and pass data message to client side
    io.emit('newMessage', {message: data.message});
  });
  // listening for event 'disconnect', event occurs when user disconnects from socket connection
  socket.on('disconnect', function() {
    // setting message equal to user name (provided from user on client side) plus string to indicate user has disconnected
    var message = users[socket.id] + ' has disconnected!';
    // emitting event 'newMessage' and passing data message (variable) to client side
    socket.broadcast.emit('newMessage', {message: message});
  });
})
