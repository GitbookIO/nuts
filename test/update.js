var request = require('supertest');
var expect = require('expect');

var app = require('./testing').app;

describe('Update', function() {
    var agent = request.agent(app);

    describe('Squirrel.Mac (OS X)', function() {

        describe('/update/osx/', function() {
            it('should return a 204 if using latest version', function(done) {
                agent
                .get('/update/osx/1.0.0')
                .expect(204, done);
            });

            it('should return a 200 with json if using old stable version', function(done) {
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

            it('should return a 200 with json if using old beta version (1)', function(done) {
                agent
                .get('/update/osx/0.9.1-beta')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.name).toBe('1.0.0');
                })
                .expect(200, done);
            });

            it('should return a 200 with json if using old beta version (2)', function(done) {
                agent
                .get('/update/osx/0.9.1-beta.1')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.name).toBe('1.0.0');
                })
                .expect(200, done);
            });

            it('should return a 200 with json if using old alpha version (1)', function(done) {
                agent
                .get('/update/osx/0.9.2-alpha.2')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.name).toBe('1.0.0');
                })
                .expect(200, done);
            });
        });

        describe('/update/channel/beta/osx', function() {
            it('should update from 0.9.1-beta to 1.0.1-beta.0', function(done) {
                agent
                .get('/update/channel/beta/osx/0.9.1-beta')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.name).toBe('1.0.1-beta.0');
                })
                .expect(200, done);
            });

            it('should not update from 1.0.1-beta.0', function(done) {
                agent
                .get('/update/channel/beta/osx/1.0.1-beta.0')
                .expect(204, done);
            });
        });

        describe('/update/channel/alpha/osx', function() {
            it('should update from 0.9.1-beta to 1.1.0-alpha.0', function(done) {
                agent
                .get('/update/channel/alpha/osx/0.9.1-beta')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.name).toBe('1.1.0-alpha.0');
                })
                .expect(200, done);
            });
        });
    });

});
