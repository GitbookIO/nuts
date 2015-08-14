var _ = require('lodash');

var platforms = {
    LINUX: 'linux',
    LINUX_32: 'linux_32',
    LINUX_64: 'linux_64',
    OSX: 'osx',
    OSX_32: 'osx_32',
    OSX_64: 'osx_64',
    WINDOWS: 'windows',
    WINDOWS_32: 'windows_32',
    WINDOWS_64: 'windows_64',

    detect: detectPlatform
};

// Reduce a platfrom id to its type
function platformToType(platform) {
    return _.first(platform.split('_'));
}

// Detect and normalize the platform name
function detectPlatform(platform) {
    var name = platform.toLowerCase();
    var prefix = "", suffix = "";

    // Detect prefix: osx, widnows or linux
    if (name.indexOf('win')  >= 0) prefix = platforms.WINDOWS;
    if (name.indexOf('linux')  >= 0 || name.indexOf('ubuntu')  >= 0) prefix = platforms.LINUX;
    if (name.indexOf('mac') >= 0 || name.indexOf('osx')  >= 0 || name.indexOf('darwin')  >= 0) prefix = platforms.OSX;

    // Detect suffix: 32 or 64
    if (name.indexOf('32') >= 0 || name.indexOf('ia32') >= 0) suffix = '32';
    if (name.indexOf('64') >= 0 || name.indexOf('x64') >= 0) suffix = '64';

    return _.compact([prefix, suffix]).join('_');
}

// Satisfies a platform
function satisfiesPlatform(platform, list) {
    if (_.contains(list, platform)) return true;

    // By default, user 32bits version
    if (_.contains(list+'_32', platform)) return true;

    return false;
}

module.exports = platforms;
module.exports.detect = detectPlatform;
module.exports.satisfies = satisfiesPlatform;
module.exports.toType = platformToType;
