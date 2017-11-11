//Configuration steps
const server = require('express')();
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser')

server.get('/', (req, res) => {res.render('main');});

const groupID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6)

server.get('/interface', (req,res) => {
    res.render('interface', {
        song: 'a song',
        mood: 'hyped',
        groupID: groupID,
    });
});

server.get('/code', (req,res) => {
    res.send(groupID);
});

server.listen(3000, () => {console.log('listening on *:3000');});

//Middleware for parsing incoming requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.set('views', path.join(__dirname, 'views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');