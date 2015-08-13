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

// Create repository client
ghrepo = client.repo(config.github.repository);


// List all available version
function listVersions() {
    return Q.nfcall(ghrepo.releases.bind(ghrepo));
}



module.exports = {
    versions: listVersions
};
