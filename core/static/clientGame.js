var socket = io();

var canvas;
var ctx;
var coordinates;
var select;
var picture;

var pix = 10;
var width = 1000;
var height = 1000;

var isTimeout = false;
var isBlocked = false;
	
var outline = {
	x: 0,
	y: 0,
	color: 'rgb(34,34,34)',
	previousColor: 'rgb(255,255,255)',
	clear: function() {
		drawPixel(this.previousColor, this.x, this.y);
	},
	draw: function() {
		drawPixel('rgb(0,0,0)', this.x, this.y);
		ctx.fillStyle = this.previousColor;
		ctx.fillRect(this.x+2, this.y+2, pix-4, pix-4);
	}
};

socket.on('connect', function() {
	socket.emit('client');
});

function init() {

	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	coordinates = document.getElementById('coordinates');
	select = document.getElementById('select');
	timeout = document.getElementById('timeout');

	socket.emit('getPicture', 'doievenneedthis', function(data) {
		picture = data;
		draw();
		canvas.addEventListener('mousedown', selectPixel);
		socket.on('update', function(changedPixels) {
			changedPixels.forEach(function(item, i, arr) {
				drawPixel(item.newColor, item.posX*pix, item.posY*pix);
				if (item.posX*pix==outline.x && item.posY*pix==outline.y) {
					outline.previousColor = item.newColor;
					if (pix >= 6)
						outline.draw();
				}
			});
		});
		//also enable button?
	});
}

function selectPixel(e) {
	if (pix >= 6)
		outline.clear();
	var rect = canvas.getBoundingClientRect();
	outline.x = Math.floor((e.clientX - rect.left) / pix) * pix;
	outline.y = Math.floor((e.clientY - rect.top) / pix) * pix;
	var pixel = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
	var data = pixel.data;
	outline.previousColor = 'rgb('+data[0]+', '+data[1]+', '+data[2]+')';
	if (pix >= 6)
		outline.draw();

	coordinates.textContent=(outline.x/pix)+", "+(outline.y/pix);
}

function clear() {
	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

function draw() {
/*
	var buffer = new Uint8ClampedArray(width * height * 4);
	for(var y = 0; y < height; y++) {
		for(var x = 0; x < width; x++) {
			var pixelColor = picture[x][y].split("(")[1].split(")")[0].split(",");
			var pos = (y * width + x) * 4;
			buffer[pos  ] = pixelColor[0];
			buffer[pos+1] = pixelColor[1];
			buffer[pos+2] = pixelColor[2];
			buffer[pos+3] = 255;
		}
	}
	var idata = ctx.createImageData(width, height);
	idata.data.set(buffer);
	ctx.putImageData(idata, 0, 0);
*/
	for (var i=0; i<width; i++)
		for (var j=0; j<height; j++) {
			ctx.fillStyle = picture[i][j];
			ctx.fillRect(i*pix, j*pix, pix, pix);
		}

	var pixel = ctx.getImageData(outline.x, outline.y, 1, 1);
	var data = pixel.data;
	outline.previousColor = 'rgb('+data[0]+', '+data[1]+', '+data[2]+')';
	if (pix >= 6) 
		outline.draw();
}

function submit(color, x, y) {
	if (isTimeout || isBlocked)
		return;

	var change = {
		newColor: color,
		posX: x/pix,
		posY: y/pix
	};

	socket.emit('changeColor', change, function() {

		drawPixel(color, x, y);

		if(x==outline.x && y==outline.y) {
			var pixel = ctx.getImageData(x, y, 1, 1);
			var data = pixel.data;
			outline.previousColor = 'rgb('+data[0]+', '+data[1]+', '+data[2]+')';
			if (pix >= 6)
				outline.draw();
		}

		enableTimeout();
	});

	if (!isTimeout){
		isBlocked = true;
	}
}

function enableTimeout() {
	isBlocked = false;
	isTimeout = true;
	var time = 10;
	setTimeout(function() {isTimeout=false}, 10000);

	function decreaseTimeout() {
		timeout.textContent = time;
		time--;
	};
	
	decreaseTimeout();
	var timeInterval = setInterval(function() {
		decreaseTimeout();
		if (time < 0)
			clearInterval(timeInterval);
	}, 1000);
}

function drawPixel(color, x, y) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, pix, pix);
}

// TODO emit size settings
// TODO? something with timeout
// TODO? resize
// TODO? user friendly interface