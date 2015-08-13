var _ = require('lodash');
var Q = require('q');
var github = require('octonode');
var semver = require('semver');

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

// Normalize tag name
function normalizeTag(tag) {
    if (tag[0] == 'v') tag = tag.slice(1);
    return tag;
}

// Detect and normalize the platform name
function detectPlatform(name) {
    var prefix = "", suffix = "";

    // Detect prefix: osx, widnows or linux
    if (name.indexOf('mac') >= 0 || name.indexOf('osx')  >= 0) prefix = 'osx';
    if (name.indexOf('win')  >= 0 || name.indexOf('osx')  >= 0) prefix = 'windows';
    if (name.indexOf('linux')  >= 0 || name.indexOf('ubuntu')  >= 0) prefix = 'linux';

    // Detect suffix: 32 or 64
    if (name.indexOf('32') >= 0 ) suffix = '32';
    if (name.indexOf('64') >= 0 ) suffix = '64';

    return _.compact([prefix, suffix]).join('_');
}

// Normalize a release to a version
function normalizeVersion(release) {
    return {
        tag: normalizeTag(release.tag_name),
        note: release.body || "",
        published_at: new Date(release.published_at),
        platforms: _.chain(release.assets).pluck('name').map(detectPlatform).compact().value()
    };
}

// List all available version
function listVersions() {
    return Q.nfcall(ghrepo.releases.bind(ghrepo))
    .spread(function(releases) {
        return _.map(releases, normalizeVersion);
    });
}

// Get a specific version
function getVersion(tag) {
    return listVersions()
    .then(function(versions) {
        var version = _.find(versions, {
            tag: normalizeTag(tag)
        });
        if (!version) throw new Error('Version not found: '+tag);
        return version;
    });
}

module.exports = {
    versions: listVersions,
    version: getVersion
};
