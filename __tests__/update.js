const request = require("supertest")

const app = require("./testing").app

describe("Update", () => {
  const agent = request.agent(app)

  describe("Squirrel.Mac (OS X)", () => {
    describe("/update/osx/", () => {
      test("should return a 204 if using latest version", (done) => {
        agent.get("/update/osx/1.0.0").expect(204, done)
      })

      test("should return a 200 with json if using old stable version", (done) => {
        agent
          .get("/update/osx/0.9.0")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.0.0")
            expect(res.body.url).toBeTruthy()
            expect(res.body.pub_date).toBeTruthy()
          })
          .expect(200, done)
      })

      test("should return a 200 with json if using old beta version (1)", (done) => {
        agent
          .get("/update/osx/0.9.1-beta")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.0.0")
          })
          .expect(200, done)
      })

      test("should return a 200 with json if using old beta version (2)", (done) => {
        agent
          .get("/update/osx/0.9.1-beta.1")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.0.0")
          })
          .expect(200, done)
      })

      test("should return a 200 with json if using old alpha version (1)", (done) => {
        agent
          .get("/update/osx/0.9.2-alpha.2")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.0.0")
          })
          .expect(200, done)
      })
    })

    describe("/update/channel/beta/osx", () => {
      test("should update from 0.9.1-beta to 1.0.1-beta.0", (done) => {
        agent
          .get("/update/channel/beta/osx/0.9.1-beta")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.0.1-beta.0")
          })
          .expect(200, done)
      })

      test("should not update from 1.0.1-beta.0", (done) => {
        agent.get("/update/channel/beta/osx/1.0.1-beta.0").expect(204, done)
      })
    })

    describe("/update/channel/alpha/osx", () => {
      test("should update from 0.9.1-beta to 1.1.0-alpha.0", (done) => {
        agent
          .get("/update/channel/alpha/osx/0.9.1-beta")
          .expect("Content-Type", /json/)
          .expect((res) => {
            expect(res.body.name).toBe("1.1.0-alpha.0")
          })
          .expect(200, done)
      })
    })
  })
})
