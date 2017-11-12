//Configuration steps
const server = require('express')();
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');
const request = require('request');
const https = require('https');
var myPythonScriptPath = 'script.py';
var PythonShell = require('python-shell');
const _ = require('underscore');
const StreamPlayer = require('stream-player');
const player = new StreamPlayer();

var http = require('http').Server(server);
var io = require('socket.io')(http);

//Middleware for parsing incoming requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

http.listen(process.env.PORT || 3000, () => {console.log('listening on *:3000');});

server.set('views', path.join(__dirname, '/views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');

//Main page endpoint
server.get('/', (req, res) => {res.redirect('/authentication');});

//Random groupID
const groupID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
var sentimentScore = null;
var urlObjQueue = [];
var urlObj;

io.on('connection', function(socket){
    socket.on('loaded', function(msg){
        console.log('connected');
    });
});

//User-facing web interface endpoint
server.get('/interface/:access_token/', (req,res) => {
    token = req.params.access_token;
    let mood = '';
    let min_tempo = 0;
    let max_tempo = 0;
    if (sentimentScore >= 0 && sentimentScore <= 0.2) {
        mood = 'Dead';
        min_tempo = 190;
    }
    else if (sentimentScore > 0.2 && sentimentScore <= 0.4) {
        mood = 'Just Breathing';
        min_tempo = 160;
        max_tempo = 190;
    }
    else if (sentimentScore > 0.4 && sentimentScore <= 0.6) {
        mood = 'Neutral';
        min_tempo = 130;
        max_tempo = 160;
    }
    else if (sentimentScore > 0.6 && sentimentScore <= 0.8) {
        mood = `Hey, that's pretty good`;
        min_tempo = 160;
        max_tempo = 190;
    }
    else {
        mood = 'Animalistic';
        max_tempo = 160;
    }
    let options = {
        url: 'https://api.spotify.com/v1/recommendations?' + 
        querystring.stringify({
                seed_genres: 'party,hip-hop,pop,dance',
                min_popularity: 70,
                min_tempo: min_tempo,
                max_tempo: max_tempo,
                limit: 100
            }),
        headers: {'Authorization': `Bearer ${token}`},
        json: true
    };
    if (sentimentScore !== null) {
        request(options, (error,response,body) => {
            if (!error && response.statusCode === 200) {
                body.tracks.forEach(track => {
                    if (track.preview_url !== null) { 
                        urlObjQueue.push({name: track.name, url: track.preview_url});         
                    }
                });
                urlObj = urlObjQueue.pop();
                io.emit('audio change', urlObj.url);
            }
        });
    }
    res.render('interface', {
        mood: mood,
        groupID: groupID,
    });
});

//GET endpoint for groupID
server.get('/code', (req,res) => {
    res.send(groupID);
});

//POST endpoint for sensor data 
//Should be in form {username: data}
server.post('/sensordata/:name/:data', (req,res) => {

	filePath = path.join(`${__dirname}/userFiles/${req.params.name}.txt`);

    //Initializes username.txt file in the userFiles directory

    console.log(req.params.name + ": " + req.params.data);

    var fs = require('fs');

    var dataArr = req.params.data.split(" ")

    var x = [];
    var y = [];
    var z = [];

    for (var i = 0; i < dataArr.length; i++) {
    	if (i%3 == 0) {
    		x.push(dataArr[i]);
    	}
    	else if (i%3 == 1) {
    		y.push(dataArr[i]);
    	}
    	else if (i%3 == 2) {
    		z.push(dataArr[i]);
    	}
    	
    }

    fs.writeFileSync(filePath,x.toString()+"\n", {'flag' : 'w'}, err => {
        if (err) {throw err;}
    });

    fs.writeFileSync(filePath,y.toString()+"\n", {'flag' : 'a'}, err => {
        if (err) {throw err;}
    });

    fs.writeFileSync(filePath,z.toString()+"\n", {'flag' : 'a'}, err => {
        if (err) {throw err;}
    });

    var options = {
        mode: 'text'
    };

    PythonShell.run('analytics/sentimentanal.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        sentimentScore = results[0];
    });

    res.send("");
});

const client_id = '6f9a8f3d71f64e21bb9b2b00f2314f9e';
const client_secret = '70e20432e1354991bf750c11f2ca047b';

//Endpoint for server to server authentication
server.get('/authentication', (req,res) => {
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
        form: {grant_type: 'client_credentials'},
        json: true
    };
      
    var token = '';
    request.post(authOptions, (error,response,body) => {
        if (!error && response.statusCode === 200) {
            token = body.access_token;
            res.redirect(`/interface/${token}/`);
        }
    });
});

//POST endpoint to initialize file for user
server.post('/removeUser/:username', (req,res) => {
	console.log(req.params.username);
	fs.unlinkSync('userFiles/' + req.params.username + '.txt');
});