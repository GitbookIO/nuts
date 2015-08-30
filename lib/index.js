var _ = require('lodash');
var Q = require('q');
var url = require('url');
var os = require('os');
var path = require('path');
var express = require('express');
var useragent = require('express-useragent');
var stores = require('stores');
var githubWebhook = require('github-webhook-handler');

var GitHub = require('./github');
var Versions = require('./versions');
var platforms = require('../lib/platforms');


// Return a express router
module.exports = function nuts(opts) {
    opts = _.defaults(opts || {}, {
        // Timeout for releases cache (seconds)
        timeout: 60*60,

        // Folder to cache assets
        cache: path.resolve(os.tmpdir(), 'nuts'),

        // Pre-fetch list of releases at startup
        preFetch: true,

        // Secret for GitHub webhook
        refreshSecret: 'secret',

        // Middlewares
        onDownload: function(version, req, next) { next(); },
        onAPIAccess: function(req, res, next) { next(); }
    });
    opts.timeout = opts.timeout * 1000;

    var router = express.Router();
    var github = GitHub(opts);
    var versions = Versions(github, opts);
    var startTime = Date.now();

    router.use(useragent.express());

    // Download links
    var cacheStore = stores(stores.FileStore, function(req, slot, next) {
        github.streamAsset(req.url).pipe(slot)
    }, {
        root: opts.cache
    });

    var serveAsset = function(req, res, version, asset) {
        // Call middleware
        return Q.nfcall(opts.onDownload, {
            version: version,
            platform: asset
        }, req, res)
        .then(function() {
            var d = Q.defer();
            res.header('Content-Length', asset.size);
            res.header('Content-Disposition', 'attachment; filename="'+asset.filename+'"');

            // Set id for stores bucket
            req.url = asset.download_url;
            req._downloadStream = github.streamAsset(asset.download_url);

            cacheStore(req, res, d.makeNodeResolver());

            return d.promise;
        });
    };

    var downloader = function(req, res, next) {
        var channel = req.params.channel;
        var platform = req.params.platform;
        var tag = req.params.tag || 'latest';
        var filetypeWanted = req.query.filetype;

        // Detect platform from useragent
        if (!platform) {
            if (req.useragent.isMac) platform = platforms.OSX;
            if (req.useragent.isWindows) platform = platforms.WINDOWS;
            if (req.useragent.isLinux) platform = platforms.LINUX;
            if (req.useragent.isLinux64) platform = platforms.LINUX_64;
        }

        if (!platform) return next(new Error('No platform specified and impossible to detect one'));

        // If specific version, don't enforce a channel
        if (tag != 'latest') channel = '*';

        versions.resolve({
            channel: channel,
            platform: platform,
            tag: tag
        })

        // Fallback to any channels if no version found on stable one
        .fail(function(err) {
            if (channel || tag != 'latest') throw err;

            return versions.resolve({
                channel: '*',
                platform: platform,
                tag: tag
            });
        })

        // Serve downloads
        .then(function(version) {
            var platformVersion = platforms.resolve(version, platform, {
                wanted: filetypeWanted? '.'+filetypeWanted : null
            });
            if (!platformVersion) throw new Error("No download available for platform "+platform+" for version "+version.tag+" ("+(channel || "beta")+")");

            // Call middleware
            return serveAsset(req, res, version, platformVersion);
        })
        .fail(next);
    };

    router.get('/', downloader);
    router.get('/download/channel/:channel/:platform?', downloader);
    router.get('/download/version/:tag/:platform?', downloader);
    router.get('/download/:platform?', downloader);

    // Redirect querystring request
    router.get('/update', function(req, res, next) {
        Q()
        .then(function() {
            if (!req.query.version) throw new Error('Requires "version" parameter');
            if (!req.query.platform) throw new Error('Requires "platform" parameter');

            return res.redirect('/update/'+req.query.platform+'/'+req.query.version);
        })
        .fail(next);
    });

    // Auto-updates: Status and Squirrel.Mac
    router.get('/update/:platform/:version', function(req, res, next) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        var platform = req.params.platform;
        var tag = req.params.version;

        Q()
        .then(function() {
            if (!tag) throw new Error('Requires "version" parameter');
            if (!platform) throw new Error('Requires "platform" parameter');

            platform = platforms.detect(platform);

            return versions.filter({
                tag: '>='+tag,
                platform: platform,
                channel: '*'
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
                "url": url.resolve(fullUrl, "/download/version/"+latest.tag+"/"+platform+"?filetype=zip"),
                "name": latest.tag,
                "notes": releaseNotes,
                "pub_date": latest.published_at.toISOString()
            });
        })
        .fail(next);
    });

    // Auto-updates: Squirrel.Windows: serve RELEASES from latest version
    router.get('/update/:platform/:version/:file', function(req, res, next) {
        var platform = 'win_32';
        var tag = req.params.version;
        var filename = req.params.file;

        Q()
        .then(function() {
            if (filename != 'RELEASES' && path.extname(filename) != '.nupkg') throw new Error('Invalid Squirrel.Windows update request: '+filename);

            platform = platforms.detect(platform);

            return versions.filter({
                tag: '>='+tag,
                platform: platform,
                channel: '*'
            });
        })
        .then(function(versions) {
            // Update needed?
            var latest = _.first(versions);
            if (!latest || latest.tag == tag) return res.status(204).send('No updates');

            // File exists
            var platformVersion = _.find(latest.platforms, {
                filename: filename
            });
            if (!platformVersion) throw new Error("File not found");

            // Call middleware
            return serveAsset(req, res, latest, platformVersion);
        })
        .fail(next);
    });

    // GitHub webhook to refresh list of versions
    var webhookHandler = githubWebhook({
        path: '/refresh',
        secret: opts.refreshSecret
    });

    webhookHandler.on('release', function(event) {
        github.clearCache();
        versions.list();
    });
    router.use(webhookHandler);

    // Middleware to do auth on api
    router.use('/api', opts.onAPIAccess);

    // Return status of the server
    router.get('/api/status', function (req, res, next) {
        res.send({
            uptime: (Date.now() - startTime)/1000
        });
    });

    // List versions
    router.get('/api/versions', function (req, res, next) {
        versions.filter({
            platform: req.query.platform,
            channel: req.query.channel || '*'
        })
        .then(function(results) {
            res.send(results);
        }, next);
    });

    // List channels
    router.get('/api/channels', function (req, res, next) {
        versions.channels()
        .then(function(results) {
            res.send(results);
        }, next);
    });

    // Returm a precise version
    router.get('/api/version/:tag', function (req, res, next) {
        versions.get(req.params.tag)
        .then(function(result) {
            res.send(result);
        }, next);
    });

    // Resolve a version using querystring parameters
    router.get('/api/resolve', function (req, res, next) {
        versions.resolve({
            channel: req.query.channel,
            platform: req.query.platform,
            tag: req.query.tag
        })
        .then(function(result) {
            res.send(result);
        }, next);
    });

    // Return stats about versions/platforms
    router.get('/api/stats', function (req, res, next) {
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

    if (opts.preFetch) versions.list();

    return {
        versions: versions,
        router: router
    };
};
module.exports.platforms = platforms;
