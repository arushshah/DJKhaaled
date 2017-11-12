//Configuration steps
const server = require('express')();
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');
const request = require('request');


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
server.get('/code', (req,res) => {res.send(groupID);});

//POST endpoint for sensor data 
//Should be in form {username: data}
server.post('/sensordata', (req,res) => {console.log(req.body);});

//POST endpoint to initialize file for user
server.post('/initializeFile/:username', (req,res) => {
    let filePath = path.join(`${__dirname}/userFiles/${req.params.username}.txt`);

    //Initializes username.txt file in the userFiles directory
    fs.writeFileSync(filePath,'', err => {
        if (err) {throw err;}
    });
});

//Endpoint to get access token for client to server authentication
server.get('/callback', (req,res) => {
    console.log(req.query.code);
    console.log(req.query.state);
    res.render('interface', {
        song: 'a song',
        mood: 'hyped',
        groupID: groupID,
    });
});

const client_id = '6f9a8f3d71f64e21bb9b2b00f2314f9e';
const client_secret = '70e20432e1354991bf750c11f2ca047b';
const redirect_uri = 'http://localhost:3000/callback';

//Endpoint to start client to server authentication
server.get('/login', (req,res) => {
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
    }));
});

//Endpoint for server to server authentication
server.get('/authentication', (req,res) => {
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {'Authorization': `Basic ${(new Buffer(`${client_id} : ${client_secret}`).toString('base64'))}`},
        form: {grant_type: 'client_credentials'},
        json: true
    };
      
    request.post(authOptions, (error,response,body) => {
        if (!error && response.statusCode === 200) {
            let token = body.access_token;
            let options = {
              url: 'https://api.spotify.com/v1/recommendations' + 
              querystring.stringify({
                    min_danceability: 1.0,
                    min_energy: 0.5
                }),
              headers: {'Authorization': `Bearer ${token}`},
              json: true
            };
            request.get(options, (error,response,body) =>{
                if (error ) {throw error;}
                body.forEach(track => console.log(track.name));
            });
        };
    })
});

server.listen(process.env.PORT || 3000, () => {console.log('listening on *:3000');});

server.set('views', path.join(__dirname, '/views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');