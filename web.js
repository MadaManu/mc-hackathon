var express = require("express");
var logfmt = require("logfmt");
var mongoose   = require('mongoose');
var config = require("./config");
var User = require('./models/user');
var bodyParser = require('body-parser');
var app = express();
mongoose.connect(config.mongoUri);

// mongo.connect(config.mongoUri, function(err, db) {
// 	if (err) {
// 		return console.dir(err);
// 	}
// 	db.createCollection('test', function(err, collection) {
// 		if (err) {
// 			return console.dir(err);
// 		}
// 		// db.collection('test', function(err, collection) {}
// 		return console.dir("YEEEEEEY!!!!");
// 	});
// });

var User = require('./models/user');

app.use(bodyParser());
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.json("Wellcome to the api!");
});


app.post('/users', function(req, res) {
	var user = new User(); 		// create a new instance of the User model
		// console.dir(req.body.name);
		user.name = req.body.name;  // set the bears name (comes from the request)
		user.password = req.body.password;

		user.save(function(err) {
			if (err) {
				res.send(err);
			}
			res.json({ message: 'User created!' });
		});
});

app.get('/users', function(req, res) {
	User.find(function(err, users) {
		if (err)
			res.send(err);
		res.json(users);
	});
});


app.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, User) {
		if (err)
			res.send(err);
		res.json(User);
	});
});


// app.configure(function () {
//   app.use(express.bodyParser());
//   app.use(express.methodOverride());
//   app.use(app.router);
//   app.use(express.static(path.join(application_root, "public")));
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

// app.get('/add/:name', function(req, res) {
//  mongo.Db.connect(mongoUri, function (err, db) {
//    db.collection('first', function(er, collection) {
//      collection.insert({'name':req.param("name")}, {safe: true}, function (er,rs){
//      });
//    });
//  });
//  res.send(req.param("name") + ' was added to database!');
//});

// app.get('/alldata', function(req, res) {
//  var data = "Maybe nothing fetched";
//  mongo.Db.connect(mongoUri, function (err, db) {
//    data = db.getCollectionNames();
//  });
//  res.send(data);
// });

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
 console.log("Listening on " + port);
});

