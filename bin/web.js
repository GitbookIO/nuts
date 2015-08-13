var express = require('express');
var useragent = require('express-useragent')

var config = require('../lib/config');
var versions = require('../lib/versions');
var download = require('../lib/download');

var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(useragent.express());

// Download links
app.get('/download/version/:tag/:platform?', function (req, res, next) {
    var platform = req.params.platform;

    versions.resolve({
        platform: platform,
        tag: req.params.tag
    })
    .then(function(version) {
        var platformVersion = version.platforms[platform];
        if (!platformVersion) throw new Error("No download available for platform "+platform+" for version "+version.tag);

        return download.stream(platformVersion.download_url, res);
    })
    .fail(next);
});


// Private API
app.get('/api/versions', function (req, res, next) {
    versions.list()
    .then(function(results) {
        res.send(results);
    }, next);
});

app.get('/api/version/:tag', function (req, res, next) {
    versions.get(req.params.tag)
    .then(function(result) {
        res.send(result);
    }, next);
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
