var _ = require('lodash');
var Q = require('q');
var semver = require('semver');

var config = require('./config');
var github = require('./github');
var platforms = require('./platforms');

// Normalize tag name
function normalizeTag(tag) {
    if (tag[0] == 'v') tag = tag.slice(1);
    return tag;
}

// Normalize a release to a version
function normalizeVersion(release) {
    // Ignore draft
    if (release.draft) return null;

    return {
        tag: normalizeTag(release.tag_name),
        notes: release.body || "",
        published_at: new Date(release.published_at),
        platforms: _.chain(release.assets)
            .map(function(asset) {
                var platform = platforms.detect(asset.name);
                if (!platform) return null;

                return [platform, {
                    download_url: asset.url,
                    download_count: asset.download_count
                }];
            })
            .compact()
            .object()
            .value()
    };
}

// Compare two version
function compareVersions(v1, v2) {
    if (semver.gt(v1.tag, v2.tag)) {
        return -1;
    }
    if (semver.lt(v1.tag, v2.tag)) {
        return 1;
    }
    return 0;
}

// List all available version
var listVersions = _.memoize(function() {
    return github.releases()
    .spread(function(releases) {
        return _.chain(releases)
            .map(normalizeVersion)
            .compact()
            .sort(compareVersions)
            .value();
    });
}, function() {
    return Math.ceil(Date.now()/config.versions.timeout)
});

// Get a specific version
function getVersion(tag) {
    return resolveVersion({
        tag: tag
    });
}

// Resolve a platform
function resolveVersion(opts) {
    opts = _.defaults(opts || {}, {
        tag: 'latest',
        platform: null
    });
    if (opts.tag == 'latest') opts.tag = '*';

    return listVersions()
    .then(function(versions) {
        var version = _.chain(versions)
            .filter(function(version) {
                // Not available for requested paltform
                if (opts.platform && !platforms.satisfies(opts.platform, _.keys(version.platforms))) return false;

                // Check tag satisfies request version
                return semver.satisfies(version.tag, opts.tag);
            })
            .first()
            .value();

        if (!version) throw new Error('Version not found: '+opts.tag);
        return version;
    });
}

module.exports = {
    list: listVersions,
    get: getVersion,
    resolve: resolveVersion
};
