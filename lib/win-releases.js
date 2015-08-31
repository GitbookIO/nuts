var _ = require('lodash');
var semver = require('semver');
var stripBom = require('strip-bom');

// Ordered list of supported channel
var CHANNEL_MAGINITUDE = 1000;
var CHANNELS = [
    'alpha', 'beta', 'unstable', 'rc'
];

// RELEASES parsing
var releaseRe = /^([0-9a-fA-F]{40})\s+(\S+)\s+(\d+)[\r]*$/;


// Hash a prerelease
function hashPrerelease(s) {
    if (_.isString(s[0])) {
        return (_.indexOf(CHANNELS, s[0]) + 1) * CHANNEL_MAGINITUDE + (s[1] || 0);
    } else {
        return s[0];
    }
};

// Map a semver version to a windows version
function normVersion(tag) {
    var parts = new semver.SemVer(tag);
    var prerelease = "";

    if (parts.prerelease && parts.prerelease.length > 0) {
        prerelease = hashPrerelease(parts.prerelease);
    }

    return [
        parts.major,
        parts.minor,
        parts.patch
    ].join('.') + (prerelease? '.'+prerelease : '');
}

// Parse RELEASES file
// https://github.com/Squirrel/Squirrel.Windows/blob/0d1250aa6f0c25fe22e92add78af327d1277d97d/src/Squirrel/ReleaseExtensions.cs#L19
function parseRELEASES(content) {
    return _.chain(stripBom(content))
        .replace('\r\n', '\n')
        .split('\n')
        .map(function(line) {
            var parts = releaseRe.exec(line);
            if (!parts) return null;

            var filename = parts[2];
            var isDelta = filename.indexOf('-full.nupkg') == -1;

            var filenameParts = filename
                .replace(".nupkg", "")
                .replace("-delta", "")
                .replace("-full", "")
                .split(/\.|-/)
                .reverse();

            var version = _.chain(filenameParts)
                .filter(function(x) {
                    return /^\d+$/.exec(x);
                })
                .reverse()
                .value()
                .join('.');

            return {
                sha: parts[1],
                filename: filename,
                size: Number(parts[3]),
                isDelta: isDelta,
                version: version
            };
        })
        .compact()
        .value();
}

// Generate a RELEASES file
function generateRELEASES(entries) {
    return _.map(entries, function(entry) {
        var filename = entry.filename;

        if (!filename) {
            filename = [
                entry.app,
                entry.version,
                entry.isDelta? 'delta.nupkg' : 'full.nupkg'
            ].join('-');
        }

        return [
            entry.sha,
            filename,
            entry.size
        ].join(' ');
    })
    .join('\n');
}

module.exports = {
    normVersion: normVersion,
    parse: parseRELEASES,
    generate: generateRELEASES
};
