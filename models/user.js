var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	name: String,
	email: String,
	password: String,
	address: String,
	creditCardNumber: String,
	expMonth: String,
	expYear: String,
	cardVeriCode: String,
	numberPlates: [{number: String, transactions:[{dateTime:String, location:String}]}]
});

module.exports = mongoose.model('User', UserSchema);