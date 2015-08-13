var _ = require('lodash');
var express = require('express');
var useragent = require('express-useragent')

var config = require('../lib/config');
var versions = require('../lib/versions');
var platforms = require('../lib/platforms');
var download = require('../lib/download');

var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(useragent.express());

// Download links
app.get('/download/version/:tag/:platform?', function (req, res, next) {
    var platform = req.params.platform;

    // Detect platform from useragent
    if (!platform) {
        if (req.useragent.isMac) platform = platforms.OSX;
        if (req.useragent.isWindows) platform = platforms.WINDOWS;
        if (req.useragent.isLinux) platform = platforms.LINUX;
        if (req.useragent.isLinux64) platform = platforms.LINUX_64;
    }

    if (!platform) return next(new Error('No platform specified and impossible to detect one'));

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

app.get('/download/:platform?', function (req, res, next) {
    res.redirect('/download/version/latest'+(req.params.platform? '/'+req.params.platform : ''));
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

app.get('/api/stats/platforms', function (req, res, next) {
    versions.list()
    .then(function(_versions) {
        var result = {};

        _.each(_versions, function(version) {
            _.each(version.platforms, function(platform, _platformID) {
                var platformID = platforms.toType(_platformID);
                result[platformID] = (result[platformID] || 0) + platform.download_count;
            });
        });

        res.send(result);
    }, next);
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
