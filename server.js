//Configuration steps
const server = require('express')();
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

//Middleware for parsing incoming requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

//Main page endpoint
server.get('/', (req, res) => {res.render('main');});

//Random groupID
const groupID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6)

//User-facing web interface endpoint
server.get('/interface', (req,res) => {
    res.render('interface', {
        song: 'a song',
        mood: 'hyped',
        groupID: groupID,
    });
});

//GET endpoint for groupID
server.get('/code', (req,res) => {
    res.send(groupID);
});

//POST endpoint for sensor data 
//Should be in form {username: data}
server.post('/sensordata', (req,res) => {
    console.log(req.body);
});

//POST endpoint to initialize file for user
server.post('/initializeFile/:username', (req,res) => {
    let filePath = path.join(`${__dirname}/userFiles/${req.params.username}.txt`);

    //Initializes username.txt file in the userFiles directory
    fs.writeFileSync(filePath,'', err => {
        if (err) {throw err;}
    });
});

server.listen(3000, () => {console.log('listening on *:3000');});

server.set('views', path.join(__dirname, 'views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');