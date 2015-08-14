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

});
