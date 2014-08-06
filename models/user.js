var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	name: String,
	email: String,
	password: String,
	creditCardNumber: String,
	expMonth: String,
	expYear: String,
	cardVeriCode: String,
	numberPlates: [String]
});

module.exports = mongoose.model('User', UserSchema);