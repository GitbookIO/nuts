var should = require('should');
var platforms = require('../lib/utils/platforms');

describe('Platforms', function() {

    describe('Detect', function() {

        it('should detect osx_64', function() {
            platforms.detect('myapp-v0.25.1-darwin-x64.zip').should.be.exactly(platforms.OSX_64);
            platforms.detect('myapp.dmg').should.be.exactly(platforms.OSX_64);
        });

        it('should detect windows_32', function() {
            platforms.detect('myapp-v0.25.1-win32-ia32.zip').should.be.exactly(platforms.WINDOWS_32);
            platforms.detect('atom-1.0.9-delta.nupkg').should.be.exactly(platforms.WINDOWS_32);
            platforms.detect('RELEASES').should.be.exactly(platforms.WINDOWS_32);
        });

        it('should detect linux', function() {
            platforms.detect('atom-amd64.deb').should.be.exactly(platforms.LINUX_64);
        });

    });

    describe('Resolve', function() {
        var version = {
            platforms: [
                {
                    "type": "osx_64",
                    "filename": "test-3.3.1-darwin.dmg",
                    "download_url": "https://api.github.com/repos/test/test2/releases/assets/793838",
                    "download_count": 2
                },
                {
                    "type": "osx_64",
                    "filename": "test-3.3.1-darwin-x64.zip",
                    "download_url": "https://api.github.com/repos/test/test2/releases/assets/793869",
                    "download_count": 0
                },
                {
                    "type": "windows_32",
                    "filename": "atom-1.0.9-delta.nupkg",
                    "size": 1457531,
                    "content_type": "application/zip",
                    "download_url": "https://api.github.com/repos/atom/atom/releases/assets/825732",
                    "download_count": 55844
                },
                {
                    "type": "windows_32",
                    "filename": "atom-1.0.9-full.nupkg",
                    "size": 78181725,
                    "content_type": "application/zip",
                    "download_url": "https://api.github.com/repos/atom/atom/releases/assets/825730",
                    "download_count": 26987
                },
                {
                    "type": "linux_64",
                    "filename": "atom-amd64.deb",
                    "size": 71292506,
                    "content_type": "application/zip",
                    "download_url": "https://api.github.com/repos/atom/atom/releases/assets/825658",
                    "download_count": 2494
                },
                {
                    "type": "windows_32",
                    "filename": "atom-windows.zip",
                    "size": 79815714,
                    "content_type": "application/zip",
                    "download_url": "https://api.github.com/repos/atom/atom/releases/assets/825729",
                    "download_count": 463
                },
                {
                    "type": "windows_32",
                    "filename": "AtomSetup.exe",
                    "size": 78675720,
                    "content_type": "application/zip",
                    "download_url": "https://api.github.com/repos/atom/atom/releases/assets/825728",
                    "download_count": 5612
                }
            ]
        };


        it('should resolve to best platform', function() {
            platforms.resolve(version, 'osx').filename.should.be.exactly("test-3.3.1-darwin.dmg"),
            platforms.resolve(version, 'win32').filename.should.be.exactly("AtomSetup.exe")
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
