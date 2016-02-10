var startTime = Date.now();

module.exports = {
    'status': function () {
        return {
            uptime: (Date.now() - startTime)/1000
        };
    },

    'versions': function (req) {
        return this.versions.filter({
            platform: req.query.platform,
            channel: req.query.channel || '*'
        });
    },

    'channels': function () {
        return this.versions.channels();
    },

    'version/:tag': function (req) {
        return this.versions.resolve({
            tag: req.params.tag,
            channel: '*'
        });
    },

    'resolve': function(req) {
        return this.versions.resolve({
            channel: req.query.channel,
            platform: req.query.platform,
            tag: req.query.tag
        });
    }
};

