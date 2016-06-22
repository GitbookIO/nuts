var
    _ = require('lodash'),
    Q = require('q'),
    should = require('should'),
    rewire = require('rewire');

describe('Versions', function() {

    var Versions = rewire('../lib/versions');

    describe('when extracting a channel from a tag', function() {

        var mockGithubReleases = [
            {
                expectations: {
                    channel: 'alpha'
                },
                data: {
                    tag_name: '0.0.8-alpha.20151214.1',
                    name: '0.0.8-alpha.20151214.1',
                    assets: [ {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-alpha.20151211.1.zip',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }, {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-alpha.20151211.1.dmg',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }]
                }
            },
            {
                expectations: {
                    channel: '3000'
                },
                data: {
                    tag_name: '0.0.8-3000.20151214.1',
                    name: '0.0.8-3000.20151214.1',
                    assets: [ {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-3000.20151211.1.zip',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }, {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-3000.20151211.1.dmg',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }]
                }
            },
            {
                expectations: {
                    channel: 'alpha'
                },
                data: {
                    tag_name: '0.0.8-alpha201512101',
                    name: '0.0.8-alpha201512101',
                    assets: [ {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-alpha201512101.zip',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }, {
                        url: 'https://api.github.com/repos/skewart/hooktest/releases/assets/1120656',
                        name: 'AlphaTest-osx-0.0.6-alpha201512101.dmg',
                        content_type: 'application/x-msdownload',
                        size: 168493,
                        download_count: 0,
                    }]
                }
            }
        ]

        _.map(mockGithubReleases, function(release) {

            var versions = new Versions({
                releases: function() {
                    return Q.fcall(function() {
                        return [release.data];
                    });
                }
            });

            var expectedChannel = release.expectations.channel,
                tag = release.data.tag_name;

            it('should get channel ' + expectedChannel + ' from tag ' + tag, function(done) {
                versions.list().then(function(versions) {
                    versions[0].channel.should.be.exactly(expectedChannel);
                    done();
                });
            });

        });

    });

    describe('filtering', function() {

        function testVersionFilter(filterName, scenarios) {
            describe('with ' + filterName, function() {
                var filterFunction = Versions.__get__(filterName);

                scenarios.forEach(function(scenario) {
                    var opts = scenario.opts,
                        description = 'with opts = { tag: ' + opts.tag + ', channel: ' + opts.channel
                            + ', platform: ' + opts.platform + ' }, return -> [' + scenario.expectation.join(', ') + ']';

                    it(description, function() {
                        var result = _.chain(testVersions)
                            .filter(filterFunction(scenario.opts))
                            .pluck('tag')
                            .value()
                            .join(', ')
                            .should.equal(scenario.expectation.join(', '));
                    });
                });
            });
        }

        var testVersions = [
            { tag: '0.0.8-alpha.1',
                channel: 'alpha',
                notes: 'More placeholder text.',
                published_at: 'Mon Dec 14 2015 12:13:58 GMT-0800 (PST)',
                platforms: [{
                    type: 'osx_64'
                }, {
                    type: 'windows_32'
                }],
                download_count: 3 },
            { tag: '0.0.7',
                channel: 'stable',
                notes: 'Kinda drifted away from the story thing and I\'m just writing random stuff now.',
                published_at: 'Mon Dec 14 2015 11:41:30 GMT-0800 (PST)',
                platforms: [{
                    type: 'osx_64'
                }, {
                    type: 'windows_32'
                }],
                download_count: 0 },
            { tag: '0.0.7-beta.1',
                channel: 'beta',
                notes: 'A beautiful brand new release',
                published_at: 'Fri Dec 11 2015 17:01:43 GMT-0800 (PST)',
                platforms: [{
                    type: 'osx_64'
                }, {
                    type: 'windows_32'
                }],
                download_count: 0 },
            { tag: '0.0.7-alpha.2',
                channel: 'alpha',
                notes: 'More excitement!!!',
                published_at: 'Fri Dec 11 2015 17:21:08 GMT-0800 (PST)',
                platforms: [{
                    type: 'osx_64'
                }, {
                    type: 'windows_32'
                }],
                download_count: 0 },
            { tag: '0.0.7-alpha.1',
                channel: 'alpha',
                notes: 'A beautiful brand new release',
                published_at: 'Fri Dec 11 2015 17:01:43 GMT-0800 (PST)',
                platforms: [{
                    type: 'windows_32'
                }],
                download_count: 0 },
            { tag: '0.0.6',
                channel: 'stable',
                notes: 'A wonderful new release!',
                published_at: 'Fri Dec 11 2015 15:55:45 GMT-0800 (PST)',
                platforms: [{
                    type: 'osx_64'
                }],
                download_count: 2 }
        ];

        testVersionFilter('newVersionFilter', [
            {
                opts: {
                    tag: '0.0.7',
                    platform: 'osx',
                    channel: undefined
                },
                expectation: ['0.0.7']
            },
            {
                opts: {
                    tag: '0.0.6',
                    platform: 'osx',
                    channel: undefined
                },
                expectation: ['0.0.7', '0.0.6']
            },
            {
                opts: {
                    tag: '0.0.7-beta.1',
                    platform: 'osx',
                    channel: undefined
                },
                expectation: ['0.0.7', '0.0.7-beta.1']
            },
            {
                opts: {
                    tag: '0.0.7-alpha.2',
                    platform: 'osx',
                    channel: 'alpha'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7-alpha.2']
            },
            {
                opts: {
                    tag: '0.0.7-beta.1',
                    platform: 'osx',
                    channel: 'beta'
                },
                expectation: ['0.0.7-beta.1']
            },
            {
                opts: {
                    tag: '0.0.7-alpha.1',
                    platform: 'windows',
                    channel: 'alpha'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7-alpha.2', '0.0.7-alpha.1']
            }
        ]);

        testVersionFilter('allVersionFilter', [
            {
                opts: {},
                expectation: ['0.0.8-alpha.1', '0.0.7', '0.0.7-beta.1', '0.0.7-alpha.2',
                    '0.0.7-alpha.1', '0.0.6']
            },
            {
                opts: {
                    platform: 'osx'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7', '0.0.7-beta.1', '0.0.7-alpha.2',
                    '0.0.6']
            },
            {
                opts: {
                    platform: 'windows'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7', '0.0.7-beta.1', '0.0.7-alpha.2',
                    '0.0.7-alpha.1']
            },
            {
                opts: {
                    channel: 'alpha'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7-alpha.2', '0.0.7-alpha.1']
            },
            {
                opts: {
                    channel: '*'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7', '0.0.7-beta.1', '0.0.7-alpha.2',
                    '0.0.7-alpha.1', '0.0.6']
            },
            {
                opts: {
                    channel: 'alpha',
                    platform: 'osx'
                },
                expectation: ['0.0.8-alpha.1', '0.0.7-alpha.2']
            },
            {
                opts: {
                    tag: '0.0.7-alpha.2'
                },
                expectation: ['0.0.7-alpha.2']
            }
        ]);

    });

});
