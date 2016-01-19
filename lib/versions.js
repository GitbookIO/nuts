var _ = require('lodash');
var Q = require('q');
var semver = require('semver');

var platforms = require('./platforms');

// Creates filter function that checks for updates
function newVersionFilter(opts) {
    return function(version) {
        // Not available for requested paltform
        if (!supportsPlatform(opts.platform, version.platforms)) return false;

        // If the caller specifies a channel then stay on that channel. Otherwise
        // look for anything closer to the main release.
        if (opts.channel) {
            return (opts.channel === version.channel &&
                    semver.rcompare(version.tag, opts.tag) <= 0);
        } else {
            return semver.satisfies(version.tag, '>=' + opts.tag);
        }
    }
}

// Creates generic filter function for all versions
function allVersionFilter(opts) {
    return function(version) {
        return ((!opts.tag || opts.tag === version.tag) &&
                matchingChannel(opts.channel, version.channel) &&
                supportsPlatform(opts.platform, version.platforms));
    }
}

function matchingChannel(requestedChannel, versionChannel) {
    return (!requestedChannel ||
             requestedChannel === '*' ||
             versionChannel === requestedChannel);
}

function supportsPlatform(requestedPlatform, versionPlatforms) {
    return (!requestedPlatform ||
            platforms.satisfies(requestedPlatform, _.pluck(versionPlatforms, 'type')));
}

module.exports = function(github, opts) {
    // Normalize tag name
    function normalizeTag(tag) {
        if (tag[0] == 'v') tag = tag.slice(1);
        return tag;
    }

    // Extract channel of version
    function extractChannel(tag) {
        var suffix = tag.split('-')[1];
        if (!suffix) return 'stable';

        return suffix.split('.')[0];
    }

    // Normalize a release to a version
    function normalizeVersion(release) {
        // Ignore draft
        if (release.draft) return null;

        var downloadCount = 0;
        var releasePlatforms = _.chain(release.assets)
            .map(function(asset) {
                var platform = platforms.detect(asset.name);
                if (!platform) return null;

                downloadCount = downloadCount + asset.download_count;
                return {
                    type: platform,
                    filename: asset.name,
                    size: asset.size,
                    content_type: asset.content_type,
                    download_url: asset.url,
                    download_count: asset.download_count
                };
            })
            .compact()
            .value();

        return {
            tag: normalizeTag(release.tag_name),
            channel: extractChannel(release.tag_name),
            notes: release.body || "",
            published_at: new Date(release.published_at),
            platforms: releasePlatforms,
            download_count: downloadCount
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
    function listVersions() {
        return github.releases()
        .then(function(releases) {
            return _.chain(releases)
                .map(normalizeVersion)
                .compact()
                .sort(compareVersions)
                .value();
        });
    }

    // Get a specific version
    function getVersion(tag) {
        return resolveVersion({
            tag: tag
        });
    }

    // Get new versions for updates
    function getNewVersions(opts) {
        return filterVersions(opts, newVersionFilter)
    }

    // Get all versions, subject to any options passed in
    function getMatchingVersions(opts) {
        return filterVersions(opts, allVersionFilter)
    }

    // Filter versions
    function filterVersions(opts, filterBuilder) {
        opts = opts || {};
        if (opts.platform) opts.platform = platforms.detect(opts.platform);

        return listVersions()
        .then(function(versions) {
            return _.chain(versions)
                .filter(filterBuilder(opts))
                .value();
        });
    }

    // Resolve a platform
    function resolveVersion(opts) {
        opts = opts || {}
        opts.channel = opts.channel || 'stable';
        if (opts.tag === 'latest') opts.tag = null;

        return filterVersions(opts, allVersionFilter)
        .then(function(versions) {
            var version = _.first(versions);
            if (!version) throw new Error('Version not found: '+opts.tag);
            return version;
        });
    }

    // Extract list of channels
    function listChannels() {
        return listVersions()
        .then(function(versions) {
            var channels = {};

            _.each(versions, function(version) {
                if (!channels[version.channel]) {
                    channels[version.channel] = {
                        latest: null,
                        download_count: 0,
                        versions_count: 0,
                        published_at: 0
                    };
                }

                channels[version.channel].download_count += version.download_count;
                channels[version.channel].versions_count += 1;
                if (channels[version.channel].published_at < version.published_at) {
                    channels[version.channel].latest = version.tag;
                    channels[version.channel].published_at = version.published_at;
                }
            });

            return channels;

            _.chain(versions)
                .pluck('channel')
                .uniq()
                .value();
        });
    }

    return {
        list: listVersions,
        get: getVersion,
        newer: getNewVersions,
        select: getMatchingVersions,
        resolve: resolveVersion,
        channels: listChannels
    };
};
