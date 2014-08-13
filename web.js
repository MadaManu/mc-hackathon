var express = require("express");
var logfmt = require("logfmt");
var mongoose   = require('mongoose');
var config = require("./config");
var User = require('./models/user');
var bodyParser = require('body-parser');
var app = express();
mongoose.connect(config.mongoUri);

app.use(bodyParser());
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.json("Welcome to the api!");
});

app.post('/user', function(req, res) {
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
						return res.json({code: "200", message: "Number plate removed", plates: user.numberPlates});
					} else {
						User.find({ numberPlates: { $elemMatch: { number: numberPlateGlobalised}}}, function(err, users) {	// Check users in the DB for the same number plate
							if (err){
								res.json({code:"3003", message:"upppsss error looking for plate"});
							} else {
								if (users.length > 0) {
									res.json({code: "3001", message: "Number plate already exists in DB"});	// and throws an error
								} else {
									var numberPlateObj = {number: numberPlateGlobalised, transaction: []}
									user.numberPlates.push(numberPlateObj);
									user.save(function (err) {
										if (err) {
											res.send(err);
										}
									});
									res.json(user);
								}
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


// POST @ /login
// > password 		| password of the user to login
// > email 			| email of user to login
// << id 			| return id of the logged in user if successfull (code: 200)
app.post('/login', function(req, res) {
	if (!req.body.password || !req.body.email) {
		res.json({code:"400", message:"not enough data!"});
	} else {
		User.find({email:req.body.email}, function(err, users) {
			if (err) {
				res.json({code:"4000", message:"DB conn failed!"});
			} else {
				if (users.length == 1) {
					if (req.body.password == users[0].password) {
						res.json({code:"200", id:users[0]._id});
					} else {
						res.json({code:"401", message:"Not allowed!"});
					}
				}

			}
		});
	}
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});

