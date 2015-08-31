var _ = require('lodash');
var Q = require('q');
var github = require('octonode');
var request = require('request');
var Buffer = require('buffer').Buffer;

module.exports = function(opts) {
    // Create an API client
    var client, ghrepo, cacheInstance = 0;

    if (opts.token) {
        client = github.client(opts.token);
    } else {
        client = github.client({
            username: opts.username,
            password: opts.password
        });
    }

    // List releases
    var listReleases = function(page) {
        page = page || 1;

        var uri = "/repos/"+opts.repository+"/releases";

        console.log('list releases', page);

        return Q.nfcall(client.get.bind(client), uri, {
            page: page,
            per_page: 100
        })
        .spread(function(statusCode, releases, headers) {
            var hasNext = (headers.link || "").search('rel="next"') >= 0;
            if (!hasNext) return releases;

            return listReleases(page+1)
            .then(function(r) {
                return releases.concat(r);
            });
        });
    };

    var cacheListReleases =_.memoize(listReleases, function() {
        return cacheInstance+Math.ceil(Date.now()/opts.timeout)
    });

    var clearCache = function() {
        cacheInstance = cacheInstance + 1;
    };

    // Stream a download to res
    var streamAsset = function (uri) {
        return request({
            uri: uri,
            method: 'get',
            headers: {
                'User-Agent': "releaser-server",
                'Accept': "application/octet-stream",
                'Authorization': opts.token? 'token '+opts.token : undefined
            },
            auth: opts.token? undefined : {
                user: opts.username,
                pass: opts.password,
                sendImmediately: true
            }
        });
    };

    // Read a asset
    var readAsset = function(uri) {
        var d = Q.defer();
        var output = Buffer([]);

        streamAsset(uri)
            .on('data', function(buf) {
                output = Buffer.concat([output, buf]);
            })
            .once('error', function(err) {
                d.reject(err);
            })
            .once('end', function() {
                d.resolve(output);
            });

        return d.promise
    }

    return {
        clearCache: clearCache,
        releases: cacheListReleases,
        streamAsset: streamAsset,
        readAsset: readAsset
    };
};

