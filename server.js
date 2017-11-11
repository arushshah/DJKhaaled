var server = require('express')();
var http = require('http').Server(server);
var io = require('socket.io')(http);

server.get('/', function(req, res){
    res.sendFile(`${__dirname}/index.html`);
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){});