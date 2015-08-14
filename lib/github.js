var _ = require('lodash');
var Q = require('q');
var github = require('octonode');
var request = require('request');

module.exports = function(opts) {
    // Create an API client
    var client, ghrepo;

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
        return Math.ceil(Date.now()/opts.timeout)
    });

    // Stream a download to res
    var streamAsset = function (uri) {
        return request({
            uri: uri,
            method: 'get',
            headers: {
                'User-Agent': "releaser-server",
                'Accept': "application/octet-stream"
            },
            auth: {
                user: opts.username,
                pass: opts.password,
                sendImmediately: true
            }
        });
    };

    return {
        releases: cacheListReleases,
        streamAsset: streamAsset
    }
};

