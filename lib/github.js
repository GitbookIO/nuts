var Q = require('q');
var github = require('octonode');

module.export = function(opts) {
    opts = opts || {};

    var client;

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

        var uri = '/repos/' + opts.repository + '/releases';

        console.log('list releases', page);

        return Q.nfcall(client.get.bind(client), uri, {
                page: page,
                per_page: 100
            })
            .spread(function(statusCode, releases, headers) {
                var hasNext = (headers.link || '').search('rel="next"') >= 0;
                if (!hasNext) return releases;

                return listReleases(page + 1)
                    .then(function(r) {
                        return releases.concat(r);
                    });
            });
    }

    return {
        listReleases: listReleases
    };
};
