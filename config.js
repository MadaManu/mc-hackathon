var Simplify = require('simplify-commerce');

// constructor
function config() {
}

module.exports = config;

config.mongoUri = 'mongodb://car_pass:Password@ds053419.mongolab.com:53419/heroku_app27894287';

Simplify.getClient({
    publicKey: 'sbpb_YjcyYTMxMzgtNjIzZi00MGIwLTgxZDgtMGI4YWEzZTBiYjg2',
    privateKey: 'ySik0pbUmWIh0ofOmMoIhj4EUBqwD9jRfXYsh+xnyat5YFFQL0ODSXAOkNtXTToq'
});

config.simpl = Simplify;
