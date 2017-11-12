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

//Middleware for parsing incoming requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.listen(process.env.PORT || 3000, () => {console.log('listening on *:3000');});

server.set('views', path.join(__dirname, '/views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');

//Main page endpoint
server.get('/', (req, res) => {
    res.redirect('/interface');
});

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
server.post('/sensordata/:name/:data', (req,res) => {

	filePath = path.join(`${__dirname}/userFiles/${req.params.name}.txt`);

    //Initializes username.txt file in the userFiles directory

    console.log(req.params.name + ": " + req.params.data);

    var fs = require('fs');

    var dataArr = req.params.data.split(" ")

    var x = []
    var y = []
    var z = []

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

    PythonShell.run('analytics/sentimentanal.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log(results[0]);
    });

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
      
    request.post(authOptions, (error,response,body) => {
        if (!error && response.statusCode === 200) {
            let token = body.access_token;
            let token_type = body.token_type;
            let options = {
              url: 'https://api.spotify.com/v1/recommendations?' + 
              querystring.stringify({
                    seed_genres: 'party,hip-hop',
                    max_danceability: 1,
                    max_energy: 0.3,
                    limit: 100
                }),
              headers: {'Authorization': ` Bearer ${token}`},
              json: true
            };
            request(options, (error,response,body) => {
                if (!error && response.statusCode === 200) {
                    
                    body.tracks.forEach(track => {
                        if (track.preview_url !== null) { 
                            console.log(track.preview_url);         
                        }
                    });
                }
            });
        };
    });
	
    res.send("");

    var options = {
        mode: 'text'
    };

});

//POST endpoint to initialize file for user
server.post('/removeUser/:username', (req,res) => {
	console.log(req.params.username);
	fs.unlinkSync('userFiles/' + req.params.username + '.txt');
});