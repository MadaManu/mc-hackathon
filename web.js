var express = require("express");
var logfmt = require("logfmt");
var mongoose   = require('mongoose');
var config = require("./config");
var User = require('./models/user');
var bodyParser = require('body-parser');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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

app.configure(function() {
	// Initialize passport for authentication
	app.use(passport.initialize());
	app.use(passport.session());
});

// Configuring passport how to check whether the email
// and password are correct
passport.use(new LocalStrategy({
		// Set field name here
		usernameField: 'email',
		passwordField: 'password'
	},
	function(email, password, done) {
		// Get email and password from input args
		// Query the user from the database
		
		User.find({emails: req.body.email}, function(err, emails) {
			// check that there is only one email returned from the DB
			if (emails.length == 1) {
				// If there is only one email found
				// that is the user trying to login
				user = emails[0];
				if(!hashing.compare(password, user.password)) {
					// If the passwords don't match
					return done(null, false, {message: 'Wrong password'});
				} else {
					// The passwords do match 
					// return null as the error and the user
					return done(null, user);
				}
			} else if (emails.length == 0) {
				// Email does not exist in DB
				return done(null, false, {message: "The user does not exist"});
			} else {
				// There are multiple instances of that email in the DB
				return done(null, false, {message: "Email is wrongly associated with more than one user"});
			}
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	// query the current user from database
	User.find({Users: req.body.id}, function(err, users) {
		// check that there is only one user returned from the DB
		var user = null;
		if (users.length == 1) {
			user = users[0];
			done(null, user);
		} else {
			done(new Error('User ' + user.id + 'does not exist'));
		}
	});
});


app.get('/', function(req, res) {
  res.json("Welcome to the api!");
});


app.get('/login', function (req, res) {
	if(req.user) {
		// already logged in
		res.redirect('/');
	} else {
		// not logged in, show the login form, remember to pass the message
		// for displaying when error happens
		res.render('login', { message: req.session.messages });
		// and then remember to clear the message
		req.session.messages = null;
	}
});

app.post('/login', function(req, res, next) {
	// Ask passport to authenticate
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			// If error happens
			return next(err);
		}

		if(!user) {
			// If authentication fails, get the error message 
			// and redirect to the login page
			req.session.messages = info.message;
			return res.redirect('/login');
		}

		// If everything is ok
		req.logIn(user, function(err) {
			if (err) {
				req.session.messages = "Error";
				return next(err);
			}

			// Set the message
			req.session.messags = "Login successfully";
			return res.redirect('/');
		});
	})(req, res, next);
});

app.post('/logout', function(req, res) {
	if(req.isAuthenticated()) {
		req.logout();
		req.session.messages = req.i18n._("Log out successfully");
	}
	res.redirect('/');
});


app.post('/user', function(req, res) {

	// Attempt to update user if there is an id present
	// If an id is found this function will execute
	// and update the user with the id

	if(req.body.id) { 
	// update of existing user
		User.findById(req.body.id, function(err, user) {
			if (err) {
				res.send(err);
			}
			// only rewrite new values
			if (req.body.name) {
				user.name = req.body.name;
			}
			if (req.body.password){
				user.password = req.body.password;
			}
			if (req.body.creditCardNumber) {
				user.creditCardNumber = req.body.creditCardNumber;
				user.expMonth = req.body.expMonth;	
				user.expYear = req.body.expYear;
				user.cardVeriCode = req.body.cardVeriCode;
			}
			// req.body.removalPlate boolean - true or false
			if (req.body.removalPlate && req.body.numberPlate) {
				if (eval(req.body.removalPlate)) {
					user.numberPlates.remove(req.body.numberPlate);
				} else {

					// Mada it might be best off if you double check my 
					// implementation on the following. It is supposed to check
					// that there is no registration plate in the db the 
					// same as what was taken in

					User.find({numberPlates: req.body.numberPlate}, function(err, users) {	// Check users in the DB for the same number plate
						// Return an array of users with matching plates

						// If this array is not empty
						// it contains a matching number plate
						if (users.length > 0) {
							// var error_message = 
							// FIX THIS!!!
							console.log("Already in DB on another or current account - look for fix");
							// res.json({code: "301", message: "Number plate already exists in DB"});	// and throws an error
						} else {
							user.numberPlates.push(req.body.numberPlate);
						}
					});
				}
			}

			user.save(function (err) {
				if (err) {
					res.send(err);
				}
			});

			res.json(user);
		});
	} else { 
	// creation of user

		// make sure the user is having the required data
		// a name would be usefull, credit card and other details

		var user = new User(); 		// create a new instance of the User model
		// console.dir(req.body.name);
		if (!req.body.email) {
			var error_message = {code: '2002', message: 'No valid email'}
			res.send(error_message);
		} else {
			// user.name = req.body.name;  // set the bears name (comes from the request)
			user.password = req.body.password;
			user.email = req.body.email;

			user.save(function(err) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'User created!' });
			});
		}
	}
});


app.get('/user', function(req, res) {
	User.find(function(err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
});


app.post('/update', function(req, res) {
	User.findById(req.body.id, function(err, user) {
		if (err) {
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

app.post('/payment', function(req, res) {
	// numberPlate 		> the number plate of the car to make the payment
	// amount			> amount of the payment IN CENTS

// make sure there's a handle for the no users found and also that there can no be the same number plate in the system twice
	User.find({numberPlates: req.body.numberPlate}, function(err, users) {
		// check that there is only one user returned from the DB
		var user = null;
		if (users.length == 1) {
			user = users[0];
		}
		config.SimplifyPay.payment.create({
	    	amount : req.body.amount,
	    	description : "Test payment",
	    	card : 
	    	{
	       		expMonth : user.expMonth,
	       		expYear : user.expYear,
	       		cvc : user.cardVeriCode,
	       		number : user.creditCardNumber
	    	},
	    	currency : "USD"
		}, 

		function(errData, data) {
	    	if(errData) {
		        res.send("Error Message: " + errData.data.error.message);
		        // handle the error
		        return;
	    	}
	    	res.send("Payment Status: " + data.paymentStatus);
		});

		// res.send("Test payment");
	});


});

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

