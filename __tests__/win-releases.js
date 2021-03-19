var winReleases = require("../lib/utils/win-releases")

describe("Windows RELEASES", function () {
  describe("Version Normalization", function () {
    test("should not changed version without pre-release", function () {
      expect(winReleases.normVersion("1.0.0")).toEqual("1.0.0")
      expect(winReleases.normVersion("4.5.0")).toEqual("4.5.0")
      expect(winReleases.normVersion("67.8.345")).toEqual("67.8.345")
    })

    test("should normalize the pre-release", function () {
      expect(winReleases.normVersion("1.0.0-alpha.1")).toEqual("1.0.0.1001")
      expect(winReleases.normVersion("1.0.0-beta.1")).toEqual("1.0.0.2001")
      expect(winReleases.normVersion("1.0.0-unstable.1")).toEqual("1.0.0.3001")
      expect(winReleases.normVersion("1.0.0-rc.1")).toEqual("1.0.0.4001")
      expect(winReleases.normVersion("1.0.0-14")).toEqual("1.0.0.14")
    })

    test("should correctly return to a semver", function () {
      expect(winReleases.toSemver("1.0.0.1001")).toEqual("1.0.0-alpha.1")
      expect(winReleases.toSemver("1.0.0.2001")).toEqual("1.0.0-beta.1")
      expect(winReleases.toSemver("1.0.0.2015")).toEqual("1.0.0-beta.15")
      expect(winReleases.toSemver("1.0.0")).toEqual("1.0.0")
    })
  })

  describe("Parsing", function () {
    var releases = winReleases.parse(
      "62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-0.178.0-full.nupkg 81272434\n" +
        "5D754139E89802E88984185D2276B54DB730CD5E atom-0.178.1-delta.nupkg 8938535\n" +
        "DD48D16EE177DD278F0A82CDDB72EBD043C767D2 atom-0.178.1-full.nupkg 81293415\n" +
        "02D56FF2DD6CB8FE059167E227433078CDAF5630 atom-0.179.0-delta.nupkg 9035217\n" +
        "8F5FDFD0BD81475EAD95E9E415579A852476E5FC atom-0.179.0-full.nupkg 81996151",
    )

    test("should have parsed all lines", function () {
      expect(Array.isArray(releases)).toEqual(true)
      expect(releases.length).toEqual(5)
    })

    test("should parse a one-line file (with utf-8 BOM)", function () {
      var oneRelease = winReleases.parse(
        "\uFEFF24182FAD211FB9EB72610B1C086810FE37F70AE3 gitbook-editor-4.0.0-full.nupkg 46687158",
      )
      expect(oneRelease.length).toEqual(1)
    })

    test("should correctly parse sha, version, isDelta, filename and size", function () {
      expect(releases[0].sha).toEqual(
        "62E8BF432F29E8E08240910B85EDBF2D1A41EDF2",
      )
      expect(releases[0].filename).toEqual("atom-0.178.0-full.nupkg")
      expect(releases[0].size).toEqual(81272434)

      expect(typeof releases[0].isDelta).toEqual("boolean")
      expect(typeof releases[0].version).toEqual("string")
    })

    test("should correctly detect deltas", function () {
      expect(releases[0].isDelta).toEqual(false)
      expect(releases[1].isDelta).toEqual(true)
    })

    test("should correctly parse versions", function () {
      expect(releases[0].version).toEqual("0.178.0")
      expect(releases[1].version).toEqual("0.178.1")
    })
  })

  describe("Generations", function () {
    var input =
      "62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-0.178.0-full.nupkg 81272434\n" +
      "5D754139E89802E88984185D2276B54DB730CD5E atom-0.178.1-delta.nupkg 8938535\n" +
      "DD48D16EE177DD278F0A82CDDB72EBD043C767D2 atom-0.178.1-full.nupkg 81293415\n" +
      "02D56FF2DD6CB8FE059167E227433078CDAF5630 atom-0.179.0-delta.nupkg 9035217\n" +
      "8F5FDFD0BD81475EAD95E9E415579A852476E5FC atom-0.179.0-full.nupkg 81996151"

    var releases = winReleases.parse(input)

    test("should correctly generate a RELEASES file", function () {
      expect(winReleases.generate(releases)).toEqual(input)
    })

    it("should correctly generate filenames", function () {
      expect(
        winReleases.generate([
          {
            sha: "62E8BF432F29E8E08240910B85EDBF2D1A41EDF2",
            version: "1.0.0",
            app: "atom",
            size: 81272434,
            isDelta: false,
          },
        ]),
      ).toEqual(
        "62E8BF432F29E8E08240910B85EDBF2D1A41EDF2 atom-1.0.0-full.nupkg 81272434",
      )
    })
  })
})
