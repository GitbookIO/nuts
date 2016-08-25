var nuts = require('../lib');

var config = {
    repository: 'SamyPesse/nuts-testing',
    token:      process.env.GITHUB_TOKEN
};

var instance = nuts.Nuts(config);
var app = nuts.createApp(config);

module.exports = {
    app: app,
    nuts: instance
};
