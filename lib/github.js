var _ = require('lodash');
var Q = require('q');
var github = require('octonode');

var config = require('./config');

// Create an API client
var client, ghrepo;

if (config.github.token) {
    client = github.client(config.github.token);
} else {
    client = github.client({
        username: config.github.username,
        password: config.github.password
    });
}

// List releases
function listReleases(page) {
    page = page || 1;

    var uri = "/repos/"+config.github.repository+"/releases";

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
    return Math.ceil(Date.now()/config.versions.timeout)
});

module.exports = {
    releases: cacheListReleases
};

