var _ = require('lodash');
var Q = require('q');
var request = require('request');

module.export = function(opts) {
    opts = opts || {};

    if (!_.isString(opts.releasesEndpoint)) {
        throw new Error('Trying to run with custom release host without specifying release endpoint.');
    }

    var client;

    if (opts.token) {
        client = request.defaults({
            'x-token': opts.token
        });
    } else {
        client = request.defaults({
            auth: {
                username: opts.username,
                password: opts.password
            }
        });
    }

    // List releases
    function listReleases() {
        console.log('list releases');

        return Q.nfcall(client.get, opts.releasesEndpoint)
            .spread(function(statusCode, releases, headers) {
                if (statusCode !== 200) {
                    return {};
                }

                return releases;
            });
    }

    return {
        listReleases: listReleases
    };
};
