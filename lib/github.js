var _ = require('lodash');
var Q = require('q');
var destroy = require('destroy');
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
    function listReleases(page) {
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
    }

    var cacheListReleases =_.memoize(listReleases, function() {
        return cacheInstance+Math.ceil(Date.now()/opts.timeout)
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
          headers['Authorization'] = 'token '+opts.token;
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

        return d.promise
    }

    return {
        clearCache: clearCache,
        releases: cacheListReleases,
        streamAsset: streamAsset,
        readAsset: readAsset
    };
};

