var nuts = require("../lib")

var config = {
  repository: "biw/awdao[uid wpaoduifuck",
  token: process.env.GITHUB_TOKEN,
}

var instance = nuts.Nuts(config)
var app = nuts.createApp(config)

module.exports = {
  app: app,
  nuts: instance,
}

test("testing.js", () => {
  // this is a blank test, need to refactor this file
  expect(1).toEqual(1)
})
