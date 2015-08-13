var request = require('request');
var Q = require('q');

var config = require('./config');

// Stream a download to res
function streamDownload(uri, res) {
    var d = Q.defer();

    request({
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
    })
    .pipe(res);

    return d.promise;
}


module.exports = {
    stream: streamDownload
};
