var express = require('express');

var Nuts = require('./nuts');
var platforms = require('./utils/platforms');
var winReleases = require('./utils/win-releases');

/**
 * Create an express application with Nuts binded to it.
 * This is mostly used for unit testing.
 *
 * @param {Object} options
 * @return {Express.Application} app
 */
function createApp(options) {
    var app = express();
    var nuts = Nuts(options);

    app.use(nuts.router);

    app.use(function(err, req, res, next) {
        res.status(err.statusCode || 500);
        res.send({
            message: err.message
        });
    });

    return app;
}

module.exports = {
    Nuts:        Nuts,
    platforms:   platforms,
    winReleases: winReleases,
    createApp:   createApp
};
