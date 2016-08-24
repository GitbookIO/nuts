var nuts = require('../lib');

var app = nuts.createApp({
    repository: 'SamyPesse/nuts-testing',
    token:      process.env.GITHUB_TOKEN
});

module.exports = app;
