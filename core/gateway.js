// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server, { wsEngine: 'ws' });

var serviceGame;

app.set('port',process.env.PORT || 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(process.env.PORT || 5000, function() {
	console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {

	socket.on('service', function() {
		serviceGame = socket;
		console.log('add service');
		//socket.join('service');
	});

	socket.on('client', function() {
		socket.join('clients');
		console.log('add client');
	});

	socket.on('getPicture', function(unusedVar, fn) {
		serviceGame.emit('getPicture', 'istilldontknow', function(data) {
			fn(data);
		});
	});

	socket.on('changeColor', function(change, fn) {
		serviceGame.emit('changeColor', change, function(){
			fn();
		});
	});

	socket.on('update', function(changedPixels) {
		io.sockets.in('clients').emit('update', changedPixels);
	});
});
