var request = require('request');
var Q = require('q');

var config = require('./config');

// Stream a download to res
function streamDownload(uri) {
    return request({
        uri: uri,
        method: 'get',
        headers: {
            'User-Agent': "releaser-server",
            'Accept': "application/octet-stream"
        },
        auth: {
            user: config.github.username,
            pass: config.github.password,
            sendImmediately: true
        }
    });
}


module.exports = {
    stream: streamDownload
};
