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

// app.configure(function() {
// 	// Initialize passport for authentication
// 	app.use(passport.initialize());
// 	app.use(passport.session());
// });

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
			} else {
				// only rewrite new values
				if (req.body.name) {
					user.name = req.body.name;
				}
				if (req.body.password){
					user.password = req.body.password;
				}
				if (req.body.creditCardNumber) {
					user.creditCardNumber = req.body.creditCardNumber;
					// strip spaces or any non number characters
					user.expMonth = req.body.expMonth;	
					user.expYear = req.body.expYear;
					user.cardVeriCode = req.body.cardVeriCode;
				}
				// req.body.removalPlate boolean - true or false
				// true if u want to remove the plate, false if u want to add a new plate
				if (req.body.removalPlate && req.body.numberPlate) {
					var numberPlateGlobalised = req.body.numberPlate.toUpperCase();
					if (eval(req.body.removalPlate)) {
						// check if that number plate exists
						user.numberPlates.remove(numberPlateGlobalised);
						res.json({code: "200", message: "Number plate removed", plates: user.numberPlates});
					} else {
						User.find({numberPlates: numberPlateGlobalised}, function(err, users) {	// Check users in the DB for the same number plate
							// capitalize every single charachter!!!!!
							if (users.length > 0) {
								res.json({code: "3001", message: "Number plate already exists in DB"});	// and throws an error
							} else {
								user.numberPlates.push(numberPlateGlobalised);
								user.save(function (err) {
									if (err) {
										res.send(err);
									}
								});
								res.json(user);
							}
						});
					}
				} else if (req.body.numberPlate && !req.body.removalPlate) {
					res.json({code: "3011", message: "Remove or add Plate?"});
				} else if (req.body.removalPlate && !req.body.numberPlate) {
					res.json({code: "3012", message: "What plate?"});
				} else {
					user.save(function (err) {
						if (err) {
							res.send(err);
						}
					});
					res.json(user);
				}
			}
		});
	} else { 
	// creation of user

		var user = new User();
		if (!req.body.email || !req.body.password || !req.body.name) {
			var error_message = {code: '2002', message: 'Not enough data for creation of account'};
			res.send(error_message);
		} else {
			var user_exists = false;
			User.find({email: req.body.email}, function(err, users) {	// Check users in the DB for the same email
				if (users.length > 0) {
					res.json({code: '2003', message: 'E-mail already exists!'});
				} else {
					user.name = req.body.name;
					user.password = req.body.password;
					user.email = req.body.email;

					// add other non required fields

					user.save(function(err) {
						if (err) {
							res.send(err);
						}
						res.json({ code: "200", message: 'User created!' });
					});
				}
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
	var numberPlateGlobalised = req.body.numberPlate.toUpperCase();
// make sure there's a handle for the no users found and also that there can no be the same number plate in the system twice
	User.find({numberPlates: numberPlateGlobalised}, function(err, users) {
		// check that there is only one user returned from the DB
		var user = null;
		if (users.length == 1) {
			user = users[0];
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
			        res.send({code: "3002", message: 'Payment failed', error: errData});
		    	} else {
		    		res.send({code: "200", message: 'Payment Approved', amount: req.body.amount, plate: numberPlateGlobalised});
		    		// save transaction to history of user
		    	}
			});
		} else {
			res.json({code: "3001", message: "Number Plate not in the system!", plate: numberPlateGlobalised, })
		}
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

