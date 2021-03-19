const request = require("supertest")
const app = require("./testing").app

/**
 * NOTE: the download test suite has a dependency on github.com
 * Work still needs to be done to refactor the code to prevent this with a mock
 */

const MAC_USERAGENT =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-us)" +
  " AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19"
const WIN_USERAGENT =
  "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; rv:11.0) like Gecko"

describe("Download", () => {
  const agent = request.agent(app)

  describe("Latest version (/)", () => {
    test("should fail if no user-agent to detect platform", (done) => {
      agent.get("/").expect(400, done)
    })

    test("should download windows file", (done) => {
      agent
        .get("/")
        .set("User-Agent", WIN_USERAGENT)
        .expect(200)
        .expect("Content-Disposition", "attachment; filename=test.exe")
        .expect("Content-Length", "22")
        .end(done)
    })

    test("should download OS X file as DMG", (done) => {
      agent
        .get("/")
        .set("User-Agent", MAC_USERAGENT)
        .expect(200)
        .expect("Content-Disposition", "attachment; filename=test-osx.dmg")
        .expect("Content-Length", "22")
        .end(done)
    })
  })

  describe("Previous version (/download/version/)", () => {
    test("should not have a windows file to download", (done) => {
      agent
        .get("/download/version/0.9.0")
        .set("User-Agent", WIN_USERAGENT)
        .expect(404)
        .end(done)
    })

    test("should download OS X file as DMG", (done) => {
      agent
        .get("/download/version/0.9.0")
        .set("User-Agent", MAC_USERAGENT)
        .expect(200)
        .expect("Content-Disposition", "attachment; filename=test-osx.dmg")
        .expect("Content-Length", "22")
        .end(done)
    })
  })
})
