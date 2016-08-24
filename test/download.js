var request = require('supertest');
var app = require('./app');

describe('Download', function() {
    var agent = request.agent(app);

    describe('Latest version', function() {

        it('should fail if no user-agent to detect platform', function(done) {
            agent
            .get('/')
            .expect(400, done);
        });

        it('should download windows file', function(done) {
            agent
            .get('/')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; rv:11.0) like Gecko')
            .expect('Content-Length', '13')
            .expect('Content-Disposition', 'attachment; filename=test.exe')
            .expect(200, done);
        });

    });

});
