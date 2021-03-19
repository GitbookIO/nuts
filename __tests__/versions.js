var versions = require("./testing").nuts.versions

describe("Versions", function () {
  describe(".list", function () {
    test("should list all versions", function () {
      return versions.list().then(function (out) {
        expect(out.length).toEqual(7)
      })
    })
  })

  describe(".filter", function () {
    test("should filter correctly by tag name", function () {
      return versions.filter({ tag: ">=0.9.0" }).then(function (out) {
        expect(out.length).toEqual(2)
        expect(out[0].tag).toEqual("1.0.0")
        expect(out[1].tag).toEqual("0.9.0")
      })
    })

    test("should filter correctly by tag name (stripChannel)", function () {
      return versions
        .filter({
          tag: ">=1.0.0",
          channel: "*",
          stripChannel: true,
        })
        .then(function (out) {
          expect(out.length).toEqual(3)
        })
    })
  })
})
