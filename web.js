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

// var User = require('./models/user');

app.use(bodyParser());
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.json("Welcome to the api!");
});


app.post('/user', function(req, res) 
{

	// Attempt to update user if there is an id present
	// If an id is found this function will execute
	// and update the user with the id

	if(req.body.id != null)
	{
		User.findById(req.body.id, function(err, user) 
		{
			if (err)
			{
				res.send(err);
			}

			user.name = req.body.name;

			user.save(function (err)
			{
				if (err) 
				{
					res.send(err);
				}
			});

			res.json(user);
		});
	}

	else
	{
		var user = new User(); 		// create a new instance of the User model
		// console.dir(req.body.name);
		if (!req.body.name) 
		{
			var error_message = {code: '2002', message: 'No valid username'}
			res.send(error_message);
		} 
		
		else 
		{
			user.name = req.body.name;  // set the bears name (comes from the request)
			user.password = req.body.password;
			user.save(function(err) 
			{
				if (err) 
				{
					res.send(err);
				}
				res.json({ message: 'User created!' });
			});
		}
	}
});


app.get('/users', function(req, res) {
	User.find(function(err, users) {
		if (err)
			res.send(err);
		res.json(users);
	});
});

// MADA Doing a funny Test :) 
// add some more magic to this 

app.post('/update', function(req, res) {
	User.findById(req.body.id, function(err, user) {
		if (err)
		{
			res.send(err);
		}

		user.name = req.body.name;
		user.save(function (err){
			if (err) {
				res.send(err);
			}
		});
		res.json(user);
		
	});
});

app.post('/payment', function(req, res)
{
	var Simplify = require("simplify-commerce"),
	client = Simplify.getClient(
	{
    	publicKey: 'sbpb_YjcyYTMxMzgtNjIzZi00MGIwLTgxZDgtMGI4YWEzZTBiYjg2',
    	privateKey: 'ySik0pbUmWIh0ofOmMoIhj4EUBqwD9jRfXYsh+xnyat5YFFQL0ODSXAOkNtXTToq'
	});

	client.payment.create({
    	amount : req.body.amount,
    	description : "Test payment",
    	card : 
    	{
       		expMonth : "11",
       		expYear : "19",
       		cvc : "123",
       		number : req.body.cardnumber
    	},
    	currency : "USD"
	}, 

	function(errData, data)
	{
    	if(errData)
    	{
	        console.error("Error Message: " + errData.data.error.message);
	        // handle the error
	        return;
    	}
    	console.log("Payment Status: " + data.paymentStatus);
	});

	res.send("Test payment");
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

