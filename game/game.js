var io = require('socket.io-client');
var socket = io.connect('https://placeclone-api.herokuapp.com');

var pix = 1;
var width = 1000;
var height = 1000;

var picture;
var changedPixels = [];

picture = new Array(width);
for (var i=0; i<width; i++) {
	picture[i] = new Array(height);
	for (var j=0; j<height; j++)
		picture[i][j] = 'rgb(255,255,255)';
}

socket.on('connect', function() {

	console.log('Connected to gateway');

	socket.emit('service');
});


socket.on('getPicture', function(unusedVar, fn) {
	fn(picture);
});

socket.on('changeColor', function(change, fn) {
	picture[change.posX][change.posY] = change.newColor;
	changedPixels.push(change);
	fn();
});

setInterval(function() {
	socket.emit('update', changedPixels);
	changedPixels = [];
}, 1000 / 60);
