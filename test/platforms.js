var should = require('should');
var platforms = require('../lib/platforms');

describe('Platforms', function() {

    describe('Detect', function() {

        it('should detect osx_64', function() {
            platforms.detect('myapp-v0.25.1-darwin-x64.zip').should.be.exactly(platforms.OSX_64)
        });

        it('should detect windows_32', function() {
            platforms.detect('myapp-v0.25.1-win32-ia32.zip').should.be.exactly(platforms.WINDOWS_32)
        });

    });

    describe('Resolve', function() {
        var version = {
            platforms: [
                {
                    "type": "osx",
                    "filename": "test-3.3.1-darwin.dmg",
                    "download_url": "https://api.github.com/repos/test/test2/releases/assets/793838",
                    "download_count": 2
                },
                {
                    "type": "osx_64",
                    "filename": "test-3.3.1-darwin-x64.dmg",
                    "download_url": "https://api.github.com/repos/test/test2/releases/assets/793868",
                    "download_count": 2
                },
                {
                    "type": "osx_64",
                    "filename": "test-3.3.1-darwin-x64.zip",
                    "download_url": "https://api.github.com/repos/test/test2/releases/assets/793869",
                    "download_count": 0
                }
            ]
        };


        it('should resolve to best platform', function() {
            platforms.resolve(version, 'osx').filename.should.be.exactly("test-3.3.1-darwin-x64.dmg")
        });

        it('should resolve to best platform with a preferred filetype', function() {
            platforms.resolve(version, 'osx', {
                filePreference: ['.zip']
            }).filename.should.be.exactly("test-3.3.1-darwin-x64.zip")
        });

        it('should resolve to best platform with a wanted filetype', function() {
            platforms.resolve(version, 'osx', {
                wanted: '.zip'
            }).filename.should.be.exactly("test-3.3.1-darwin-x64.zip")
        });
    })

});
