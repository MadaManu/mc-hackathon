
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/add/:name', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('first', function(er, collection) {
      collection.insert({'name':"value", function (er,rs){
      });
    });
  });
  res.send(req.param("name") + ' was added to database!');
});

app.get('/alldata', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    res.send(db.first.find());
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

