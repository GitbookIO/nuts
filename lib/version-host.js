var _ = require('lodash');
var destroy = require('destroy');
var request = require('request');
var Buffer = require('buffer').Buffer;

var github = require('./github');
var bitbucket = require('./bitbucket');

module.exports = function(opts) {
    // Create an API client interface
    var versionHost, cacheInstance = 0;

    // Initialize host interface depending on type
    if (opts && _.isString(opts.releasesEndpoint)) {
        versionHost = bitbucket(opts);
    } else {
        versionHost = github(opts);
    }

    var cacheListReleases = _.memoize(versionHost.listReleases, function() {
        return cacheInstance + Math.ceil(Date.now() / opts.timeout);
    });

    function clearCache() {
        cacheInstance = cacheInstance + 1;
    }

    // Stream a download to res
    function streamAsset(uri) {
        var headers = {
            'User-Agent': "releaser-server",
            'Accept': "application/octet-stream"
        };
        var httpAuth = null;

        if (opts.token) {
            headers.Authorization = 'token ' + opts.token;
        } else if (opts.username) {
            httpAuth = {
                user: opts.username,
                pass: opts.password,
                sendImmediately: true
            };
        }

        return request({
            uri: uri,
            method: 'get',
            headers: headers,
            auth: httpAuth
        });
    }

    // Read a asset
    function readAsset(uri) {
        var d = Q.defer();
        var output = Buffer([]);
        var res = streamAsset(uri);

        var cleanup = function() {
            destroy(res);
            res.removeAllListeners();
        };

        res
            .on('data', function(buf) {
                output = Buffer.concat([output, buf]);
            })
            .on('error', function(err) {
                cleanup();
                d.reject(err);
            })
            .on('end', function() {
                cleanup();
                d.resolve(output);
            });

        return d.promise;
    }

    return {
        clearCache: clearCache,
        releases: cacheListReleases,
        streamAsset: streamAsset,
        readAsset: readAsset
    };
};
