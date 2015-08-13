var express = require('express');
var app = express();

var config = require('../lib/config');
var github = require('../lib/github');

app.get('/', function (req, res) {
    res.send('Hello World!');
});


// API
app.get('/api/versions', function (req, res, next) {
    github.versions()
    .then(function(versions) {
        res.send(versions);
    }, next);
});

app.get('/api/version/:tag', function (req, res, next) {
    github.version(req.params.tag)
    .then(function(version) {
        res.send(version);
    }, next);
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
