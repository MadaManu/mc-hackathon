
 var express = require("express");
// var fortune = require("fortune");
// app=fortune({adapter: 'mongodb'});
var logfmt = require("logfmt");

//var datastore = require("mongodb");
//var db = new datastore();

var app = express();
// var mongo = require('mongodb');
// var mongoUri = process.env.MONGOLAB_URI ||
//   process.env.MONGOHQ_URL ||
//   'mongodb://localhost/mydb';

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('mada :) !!!');
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

// var port = Number(process.env.PORT || 5000);
// app.listen(port, function() {
//  console.log("Listening on " + port);
//});

