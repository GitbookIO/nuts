var express = require('express');
var uuid = require('uuid');
var basicAuth = require('basic-auth');
var Analytics = require('analytics-node');
var nuts = require('../');

var app = express();

var apiAuth =  {
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD
};

var analytics = undefined;
if (process.env.ANALYTICS_TOKEN) {
    analytics = new Analytics(process.env.ANALYTICS_TOKEN);
}

var myNuts = nuts.Nuts({
    repository: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME,
    password: process.env.GITHUB_PASSWORD,
    timeout: process.env.VERSIONS_TIMEOUT,
    cache: process.env.VERSIONS_CACHE,
    refreshSecret: process.env.GITHUB_SECRET,

    onDownload: function(download, req, res, next) {
        console.log('download', download.platform.filename, "for version", download.version.tag, "on channel", download.version.channel, "for", download.platform.type);

        // Track on segment if enabled
        if (analytics) {
            var userId = req.query.user;

            analytics.track({
                event: process.env.ANALYTICS_EVENT_DOWNLOAD || 'download',
                anonymousId: userId? null : uuid.v4(),
                userId: userId,
                properties: {
                    version: download.version.tag,
                    channel: download.version.channel,
                    platform: download.platform.type,
                    os: nuts.platforms.toType(download.platform.type)
                }
            });
        }

        next();
    },

    onAPIAccess: function(req, res, next) {
        if (!apiAuth.username) return next();

        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.send(401);
        };

        var user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        };

        if (user.name === apiAuth.username && user.pass === apiAuth.password) {
            return next();
        } else {
            return unauthorized(res);
        };
    }
});

app.use(myNuts.router);

// Error handling
app.use(function(req, res, next) {
    res.status(404).send("Page not found");
});
app.use(function(err, req, res, next) {
    var msg = err.message || err;
    var code = 500;

    console.error(err.stack || err);

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

// Start the HTTP server
var server = app.listen(process.env.PORT || 5000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
