var _ = require('lodash');
var Q = require('q');
var util = require('util');
var AWS = require('aws-sdk');

var Backend = require('./backend');

function S3Backend() {
    var that = this;
    Backend.apply(this, arguments);

    this.opts = _.defaults(this.opts || {}, {
        proxyAssets: true
    });

    if (!this.opts.credentials.aws.accessKeyId || !this.opts.credentials.aws.secretAccessKey || !this.opts.configuration.aws.bucket) {
        throw new Error('S3 backend requires "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", and "AWS_BUCKET" options');
    }

    AWS.config.accessKeyId = this.opts.credentials.aws.accessKeyId;
    AWS.config.secretAccessKey = this.opts.credentials.aws.secretAccessKey;

    this.client = new AWS.S3();
    this.releases = this.memoize(this._releases);
}

util.inherits(S3Backend, Backend);

// List all releases for this repository
S3Backend.prototype._releases = function() {
    var client = this.client;
    var bucket = this.opts.configuration.aws.bucket;
    var d = Q.defer();
    var params = {
        Bucket: bucket,
        Prefix: this.opts.configuration.aws.releasesPrefix + '/',
        Delimiter: '/'
    }

    client.listObjects(params, function (err, data) {
        if (err) d.reject(err);

        var folders = data.CommonPrefixes.map(function (commonPrefix) {
            var deferFolder = Q.defer();
            var folderParams = {
                Bucket: bucket,
                Prefix: commonPrefix.Prefix
            }

            client.listObjects(folderParams, function (err, contents) {
                if (err) d.reject(err);

                return deferFolder.resolve(contents);
            });

            return deferFolder.promise;
        });

        Q.all(folders).done(function (values) {
            var releases = values.map(function (release) {
                var tag = release.Prefix.split('/').slice(-2)[0];

                return {
                    channel: 'stable',
                    tag_name: tag,
                    assets: release.Contents.map(function (content) {
                        return {
                            id: content.ETag,
                            tag_name: tag,
                            key: content.Key,
                            name: content.Key.split('/').slice(-1)[0],
                            size: content.Size,
                            content_type: 'application/zip'
                        }
                    })
                }
            });

            d.resolve(releases);
        });
    });

    return d.promise;
};

S3Backend.prototype.serveAsset = function(asset, req, res) {
    return Backend.prototype.serveAsset.apply(this, arguments);
};

// Return stream for an asset
S3Backend.prototype.getAssetStream = function(asset) {
    var params = {
        Bucket: this.opts.configuration.aws.bucket,
        Key: asset.raw.key
    };

    return Q(this.client.getObject(params).createReadStream());
};

module.exports = S3Backend;
