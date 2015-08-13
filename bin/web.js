var _ = require('lodash');
var Q = require('q');
var url = require('url');
var express = require('express');
var useragent = require('express-useragent');
var basicAuth = require('basic-auth');

var config = require('../lib/config');
var versions = require('../lib/versions');
var platforms = require('../lib/platforms');
var download = require('../lib/download');

var app = express();
var startTime = Date.now();

app.use(useragent.express());

app.get('/', function (req, res) {
    res.redirect('/download/version/latest');
});

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

// Auto-updater
app.get('/update', function(req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var platform, tag;

    Q()
    .then(function() {
        if (!req.query.version) throw new Error('Requires "version" parameter');
        if (!req.query.platform) throw new Error('Requires "platform" parameter');

        platform = platforms.detect(req.query.platform);
        tag = req.query.version;

        return versions.resolve({
            tag: '>='+req.query.version,
            platform: platform
        });
    })
    .then(function(version) {
        var status = 200;
        if (version.tag == tag) status = 204;

        res.status(status).send({
            "url": url.resolve(fullUrl, "/download/version/"+version.tag+"/"+platform),
            "name": version.tag,
            "notes": version.notes,
            "pub_date": version.published_at.toISOString()
        });
    }, function() {
        res.status(204).send('No updates');
    });
});

// Private API
if (config.api.username && config.api.password) {
    app.use('/api', function (req, res, next) {
        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.send(401);
        };

        var user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        };

        if (user.name === config.api.username && user.pass === config.api.password) {
            return next();
        } else {
            return unauthorized(res);
        };
    });
}

app.get('/api/status', function (req, res, next) {
    res.send({
        uptime: (Date.now() - startTime)/1000
    });
});

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

// Error handling
app.use(function(req, res, next) {
    res.status(404).send("Page not found");
});
app.use(function(err, req, res, next) {
    var msg = err.message || err;
    var code = 500;

    // Return error
    res.format({
        'text/plain': function(){
            res.status(code).send(msg);
        },
        'text/html': function () {
            res.status(code).send(msg);
        },
        'application/json': function (){
            res.status(code).send({
                'error': msg,
                'code': code
            });
        }
    });
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
