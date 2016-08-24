var request = require('supertest');
var expect = require('expect');
var app = require('./app');

describe('Update', function() {
    var agent = request.agent(app);

    describe('Squirrel.Mac (OS X)', function() {

        it('should return a 204 if using latest version', function(done) {
            agent
            .get('/update/osx/1.0.0')
            .expect(204, done);
        });

        it('should return a 200 with json if using old version', function(done) {
            agent
            .get('/update/osx/0.9.0')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                expect(res.body.name).toBe('1.0.0');
                expect(res.body.url).toExist();
                expect(res.body.pub_date).toExist();
            })
            .expect(200, done);
        });

    });

});
