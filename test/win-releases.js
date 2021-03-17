require('should');
var winReleases = require('../lib/utils/win-releases');

describe('Windows RELEASES', function() {

    describe('Version Normalization', function() {

        it('should not changed version without pre-release', function() {
            winReleases.normVersion('1.0.0').should.be.exactly('1.0.0');
            winReleases.normVersion('4.5.0').should.be.exactly('4.5.0');
            winReleases.normVersion('67.8.345').should.be.exactly('67.8.345');
        });

        it('should normalize the pre-release', function() {
            winReleases.normVersion('1.0.0-alpha.1').should.be.exactly('1.0.0.1001');
            winReleases.normVersion('1.0.0-beta.1').should.be.exactly('1.0.0.2001');
            winReleases.normVersion('1.0.0-unstable.1').should.be.exactly('1.0.0.3001');
            winReleases.normVersion('1.0.0-rc.1').should.be.exactly('1.0.0.4001');
            winReleases.normVersion('1.0.0-14').should.be.exactly('1.0.0.14');
        });

        it('should correctly return to a semver', function() {
            winReleases.toSemver('1.0.0.1001').should.be.exactly('1.0.0-alpha.1');
            winReleases.toSemver('1.0.0.2001').should.be.exactly('1.0.0-beta.1');
            winReleases.toSemver('1.0.0.2015').should.be.exactly('1.0.0-beta.15');
            winReleases.toSemver('1.0.0').should.be.exactly('1.0.0');
        });

    });

    describe('Parsing', function() {
        var releases = winReleases.parse(
            '62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-0.178.0-full.nupkg 81272434\n' +
            '5D754139E89802E88984185D2276B54DB730CD5E atom-0.178.1-delta.nupkg 8938535\n' +
            'DD48D16EE177DD278F0A82CDDB72EBD043C767D2 atom-0.178.1-full.nupkg 81293415\n' +
            '02D56FF2DD6CB8FE059167E227433078CDAF5630 atom-0.179.0-delta.nupkg 9035217\n' +
            '8F5FDFD0BD81475EAD95E9E415579A852476E5FC atom-0.179.0-full.nupkg 81996151'
        );

        it('should have parsed all lines', function() {
            releases.should.be.an.Array();
            releases.length.should.be.exactly(5);
        });

        it('should parse a one-line file (with utf-8 BOM)', function() {
            var oneRelease = winReleases.parse('\uFEFF24182FAD211FB9EB72610B1C086810FE37F70AE3 gitbook-editor-4.0.0-full.nupkg 46687158');
            oneRelease.length.should.be.exactly(1);
        });

        it('should correctly parse sha, version, isDelta, filename and size', function() {
            releases[0].sha.should.be.a.String();
            releases[0].sha.should.be.exactly('62E8BF432F29E8E08240910B85EDBF2D1A41EDF2');

            releases[0].filename.should.be.a.String();
            releases[0].filename.should.be.exactly('atom-0.178.0-full.nupkg');

            releases[0].size.should.be.a.Number();
            releases[0].size.should.be.exactly(81272434);

            releases[0].isDelta.should.be.a.Boolean();
            releases[0].version.should.be.a.String();
        });

        it('should correctly detect deltas', function() {
            releases[0].isDelta.should.be.False();
            releases[1].isDelta.should.be.True();
        });

        it('should correctly parse versions', function() {
            releases[0].version.should.be.exactly('0.178.0');
            releases[1].version.should.be.exactly('0.178.1');
        });

    });

    describe('Generations', function() {
        var input = '62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-0.178.0-full.nupkg 81272434\n' +
            '5D754139E89802E88984185D2276B54DB730CD5E atom-0.178.1-delta.nupkg 8938535\n' +
            'DD48D16EE177DD278F0A82CDDB72EBD043C767D2 atom-0.178.1-full.nupkg 81293415\n' +
            '02D56FF2DD6CB8FE059167E227433078CDAF5630 atom-0.179.0-delta.nupkg 9035217\n' +
            '8F5FDFD0BD81475EAD95E9E415579A852476E5FC atom-0.179.0-full.nupkg 81996151';

        var releases = winReleases.parse(input);


        it('should correctly generate a RELEASES file', function() {
            winReleases.generate(releases).should.be.exactly(input);
        });

        it('should correctly generate filenames', function() {
            winReleases.generate([
                {
                    sha: '62E8BF432F29E8E08240910B85EDBF2D1A41EDF2',
                    version: '1.0.0',
                    app: 'atom',
                    size: 81272434,
                    isDelta: false
                }
            ]).should.be.exactly('62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-1.0.0-full.nupkg 81272434');
        });

    });

});
