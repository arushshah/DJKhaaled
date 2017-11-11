//Configuration steps
var server = require('express')();
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser')

server.get('/', function(req, res){res.render('main');});

server.listen(3000, function(){console.log('listening on *:3000');});

//Middleware for parsing incoming requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.set('views', path.join(__dirname, 'views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');