const express = require("express")

const Nuts = require("./nuts")
const platforms = require("./utils/platforms")
const winReleases = require("./utils/win-releases")

/**
 * Create an express application with Nuts binded to it.
 * This is mostly used for unit testing.
 *
 * @param {Object} options
 * @return {Express.Application} app
 */
const createApp = (options) => {
  const app = express()
  const nuts = Nuts(options)

  app.use(nuts.router)

  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500)
    res.send({
      message: err.message,
    })
  })

  return app
}

module.exports = {
  Nuts: Nuts,
  platforms: platforms,
  winReleases: winReleases,
  createApp: createApp,
}
