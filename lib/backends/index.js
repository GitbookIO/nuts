var _ = require('lodash');

var BACKENDS = {
    github: require('./github')
};

module.exports = function(backend) {
    if (_.isString(backend)) return BACKENDS[backend];
    return backend;
};
