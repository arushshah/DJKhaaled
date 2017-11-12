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

	
    res.send("");
});

//POST endpoint to initialize file for user
server.post('/removeUser/:username', (req,res) => {
	console.log(req.params.username);
	fs.unlinkSync('userFiles/' + req.params.username + '.txt');
});

server.listen(process.env.PORT || 3000, () => {console.log('listening on *:3000');});

server.set('views', path.join(__dirname, '/views'));
server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');
