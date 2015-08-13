var os = require('os');
var path = require('path');

module.exports = {
    port: process.env.PORT || 6000,

    github: {
        repository: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN,
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD
    },

    api: {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    },

    versions: {
        timeout: Number(process.env.VERSIONS_TIMEOUT || 60*60)*1000,
        cache: process.env.VERSIONS_CACHE || path.resolve(os.tmpdir(), 'nuts')
    }
};
