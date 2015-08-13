var express = require('express');
var app = express();

var config = require('../lib/config');
var github = require('../lib/github');

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/versions', function (req, res, next) {
    github.versions()
    .then(function(versions) {
        res.send(versions);
    }, next);
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
