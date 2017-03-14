var request = require('supertest');
var app = require('./testing').app;

var MAC_USERAGENT = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-us)'
        + ' AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19';
var WIN_USERAGENT = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; rv:11.0) like Gecko';

describe('Download', function() {
    var agent = request.agent(app);

    describe('Latest version (/)', function() {

        it('should fail if no user-agent to detect platform', function(done) {
            agent
            .get('/')
            .expect(400, done);
        });

        it('should download windows file', function(done) {
            agent
            .get('/')
            .set('User-Agent', WIN_USERAGENT)
            .expect('Content-Length', '13')
            .expect('Content-Disposition', 'attachment; filename=test.exe')
            .expect(200, done);
        });

        it('should download OS X file as DMG', function(done) {
            agent
            .get('/')
            .set('User-Agent', MAC_USERAGENT)
            .expect('Content-Length', '19')
            .expect('Content-Disposition', 'attachment; filename=test-osx.dmg')
            .expect(200, done);
        });

    });

    describe('Previous version (/download/version/)', function() {
        it('should not have a windows file to download', function(done) {
            agent
            .get('/download/version/0.9.0')
            .set('User-Agent', WIN_USERAGENT)
            .expect(404, done);
        });

        it('should download OS X file as DMG', function(done) {
            agent
            .get('/download/version/0.9.0')
            .set('User-Agent', MAC_USERAGENT)
            .expect('Content-Length', '19')
            .expect('Content-Disposition', 'attachment; filename=test-osx.dmg')
            .expect(200, done);
        });
    });

});
