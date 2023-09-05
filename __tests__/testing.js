const nuts = require("../lib")

const config = {
  token: process.env.GITHUB_TOKEN,
}

const instance = nuts.Nuts(config)
const app = nuts.createApp(config)

module.exports = {
  app: app,
  nuts: instance,
}

test("testing.js", () => {
  // this is a blank test, need to refactor this file
  expect(1).toEqual(1)
})
