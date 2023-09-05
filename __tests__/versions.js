const versions = require("./testing").nuts.versions

describe("Versions", () => {
  describe(".list", () => {
    test("should list all versions", () => {
      return versions.list().then((out) => {
        expect(out.length).toEqual(7)
      })
    })
  })

  describe(".filter", () => {
    test("should filter correctly by tag name", () => {
      return versions.filter({ tag: ">=0.9.0" }).then((out) => {
        expect(out.length).toEqual(2)
        expect(out[0].tag).toEqual("1.0.0")
        expect(out[1].tag).toEqual("0.9.0")
      })
    })
  })
})
