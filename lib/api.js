var startTime = Date.now();

module.exports = {
    'status': function () {
        return {
            uptime: (Date.now() - startTime)/1000
        };
    },

    'versions': function (req) {
        return {
            platform: req.query.platform,
            channel: req.query.channel || '*'
        };
    },

    'channels': function () {
        return this.versions.channels();
    },

    'version/:tag': function (req) {
        return this.versions.get(req.params.tag);
    },

    'resolve': function(req) {
        return this.versions.resolve({
            channel: req.query.channel,
            platform: req.query.platform,
            tag: req.query.tag
        });
    }
};

