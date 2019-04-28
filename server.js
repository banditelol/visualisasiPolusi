const express = require('express');
const app = express();
const http = require('http').Server(app); //require http server, and create server with function handler()
const io = require('socket.io')(http); //require socket.io module and pass the http object (server)
const path = require('path');
const Gpio = require('pigpio').Gpio; //include onoff to interact with the GPIO

const buttonPins = [13, 16, 19, 20, 26, 21];
const ledRed = new Gpio(15, {mode: Gpio.OUTPUT});
const ledGreen = new Gpio(14, {mode: Gpio.OUTPUT});
const ledBlue = new Gpio(18, {mode: Gpio.OUTPUT});
const fan = new Gpio(23, {mode:Gpio.OUTPUT});

let buttons = new Array(buttonPins.length);
let videoIndex = 1;

for (i = 0; i < buttons.length; i++) {
    buttons[i] = new Gpio(buttonPins[i],{
    	mode: Gpio.INPUT,
	pullUpDown : Gpio.PUD_UP,
	edge: Gpio.EITHER_EDGE
    });
}

buttons.forEach(function (button, index) {
    button.on('interrupt', (level) => {
	console.log("the level is", level);
	if(level === 0){
		videoIndex = index + 1;
		console.log("videoIndex",videoIndex);
		controlOutputState(videoIndex);
		io.emit("vid", videoIndex);
	}
    });
})

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public/video')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

io.sockets.on('connection', function (socket) { // WebSocket Connection //static variable for current status
    socket.emit("vid", videoIndex);
    controlOutputState(videoIndex);
    videoIndex = incrementVideoIndex(videoIndex);
});

function setLedColor(red = 255, green= 255, blue = 255){
    	ledRed.pwmWrite(red);
	ledGreen.pwmWrite(green);
	ledBlue.pwmWrite(blue);
}

function turnFanOn(fan, on = true){
	if(on){
		fan.digitalWrite(1);
	} else {
		fan.digitalWrite(0);
	}
}

function controlOutputState(videoIndex){
	switch(videoIndex) {
		case 1:
			setLedColor(0,255,0);
			turnFanOn(fan, false);
			break;
		case 2:
			setLedColor(12,200,12);
			turnFanOn(fan, false);
			break;
		case 3:
			setLedColor(50,150, 12);
			turnFanOn(fan, false);
			break;
		case 4:
			setLedColor(150, 150, 24);
			turnFanOn(fan, true);
			break;
		case 5:
			setLedColor(220, 100, 10);
			turnFanOn(fan, true);
			break;
		case 6:
			setLedColor(255, 0, 0);
			turnFanOn(fan, true);
			break;
		default:
			console.log("unhandled");
	}
}

function incrementVideoIndex(index, thres = 6) {
    return index % thres + 1;
}
