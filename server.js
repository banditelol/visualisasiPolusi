var express = require('express');
var app = express();
var http = require('http').Server(app); //require http server, and create server with function handler()
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var path = require('path');
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var buttonPins = [13, 16, 19, 20, 21, 26];
var buttons = new Array(buttonPins.length);
var videoIndex = 1;

for (i = 0; i < buttons.length; i++) {
    buttons[i] = new Gpio(buttonPins[i], 'in', 'both');
}
buttons.forEach(function (button, index) {
    button.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        io.emit('vid', index + 1); //turn LED on or off depending on the button state (0 or 1)
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
    socket.emit("vid", incrementVideoIndex);
    videoIndex = incrementVideoIndex(videoIndex);
});


setInterval(function () {
    io.emit("vid", videoIndex);
    videoIndex = incrementVideoIndex(videoIndex);
}, 3000);

function incrementVideoIndex(index, thres = 6) {
    return index % thres + 1;
}