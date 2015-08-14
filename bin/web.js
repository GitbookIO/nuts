var _ = require('lodash');
var Q = require('q');
var url = require('url');
var express = require('express');
var useragent = require('express-useragent');
var basicAuth = require('basic-auth');
var stores = require('stores');

var config = require('../lib/config');
var versions = require('../lib/versions');
var platforms = require('../lib/platforms');
var download = require('../lib/download');

var app = express();
var startTime = Date.now();

app.use(useragent.express());


// Download links
var downloader = stores(stores.FileStore, function(req, slot, next) {
    var channel = req.params.channel;
    var platform = req.params.platform;
    var tag = req.params.tag;

    // Detect platform from useragent
    if (!platform) {
        if (req.useragent.isMac) platform = platforms.OSX;
        if (req.useragent.isWindows) platform = platforms.WINDOWS;
        if (req.useragent.isLinux) platform = platforms.LINUX;
        if (req.useragent.isLinux64) platform = platforms.LINUX_64;
    }

    if (!platform) return next(new Error('No platform specified and impossible to detect one'));

    versions.resolve({
        channel: channel,
        platform: platform,
        tag: tag
    })
    .then(function(version) {
        var platformVersion = version.platforms[platform];
        if (!platformVersion) throw new Error("No download available for platform "+platform+" for version "+version.tag+" ("+(channel || "beta")+")");

        return download.stream(platformVersion.download_url).pipe(slot);
    })
    .fail(next);
}, {
    root: config.versions.cache
})

app.get('/', downloader);
app.get('/download/channel/:channel/:platform?', downloader);
app.get('/download/version/:tag/:platform?', downloader);
app.get('/download/:platform?', downloader);

// Auto-updater
app.get('/update', function(req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var platform, tag;

    Q().then(function() {
        if (!req.query.version) throw new Error('Requires "version" parameter');
        if (!req.query.platform) throw new Error('Requires "platform" parameter');

        platform = platforms.detect(req.query.platform);
        tag = req.query.version;

        return versions.filter({
            tag: '>='+req.query.version,
            platform: platform
        });
    })
    .then(function(versions) {
        var latest = _.first(versions);
        if (!latest || latest.tag == tag) return res.status(204).send('No updates');

        var releaseNotes = _.chain(versions)
            .pluck('notes')
            .compact()
            .reduce(function(prev, value) {
                return prev + '\n' + value;
            }, "")
            .value();

        res.status(200).send({
            "url": url.resolve(fullUrl, "/download/version/"+latest.tag+"/"+platform),
            "name": latest.tag,
            "notes": releaseNotes,
            "pub_date": latest.published_at.toISOString()
        });
    })
    .fail(next);
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
    versions.filter({
        platform: req.query.platform,
        channel: req.query.channel
    })
    .then(function(results) {
        res.send(results);
    }, next);
});

app.get('/api/channels', function (req, res, next) {
    versions.channels()
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

app.get('/api/stats', function (req, res, next) {
    var stats = {
        total: 0,
        platforms: {}
    };

    versions.list()
    .then(function(_versions) {
        _.each(_versions, function(version, i) {
            _.each(version.platforms, function(platform, _platformID) {
                // Increase platform count
                var platformID = platforms.toType(_platformID);
                stats.platforms[platformID] = (stats.platforms[platformID] || 0) + platform.download_count;
            });
        });

        stats.total = _.sum(stats.platforms);

        res.send(stats);
    })
    .fail(next);
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
