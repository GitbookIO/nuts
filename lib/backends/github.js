const _ = require("lodash")
const Q = require("q")
const util = require("util")
const GitHub = require("octocat")
const request = require("request")
const githubWebhook = require("github-webhook-handler")

const Backend = require("./backend")

const GitHubBackend = function () {
  Backend.apply(this, arguments)

  this.opts = _.defaults(this.opts || {}, {
    proxyAssets: true,
  })

  if ((!this.opts.username || !this.opts.password) && !this.opts.token) {
    throw new Error('GitHub backend require "username" and "token" options')
  }

  this.client = new GitHub({
    token: this.opts.token,
    endpoint: this.opts.endpoint || "https://api.github.com",
    username: this.opts.username,
    password: this.opts.password,
  })

  this.ghrepo = this.client.repo(this.opts.repository)
  this.releases = this.memoize(this._releases)

  // GitHub webhook to refresh list of versions
  this.webhookHandler = githubWebhook({
    path: "/refresh",
    secret: this.opts.refreshSecret,
  })

  // Webhook from GitHub
  this.webhookHandler.on("release", (event) => {
    this.onRelease()
  })
  this.nuts.router.use(this.webhookHandler)
}
util.inherits(GitHubBackend, Backend)

/**
 * List all releases for this repository
 * @return {Promise<Array<Release>>}
 */
GitHubBackend.prototype._releases = function () {
  return this.ghrepo.releases().then((page) => {
    return page.all()
  })
}

/**
 * Return stream for an asset
 * @param {Asset} asset
 * @param {Request} req
 * @param {Response} res
 * @return {Promise}?
 */
GitHubBackend.prototype.serveAsset = function (asset, req, res) {
  if (!this.opts.proxyAssets) {
    res.redirect(asset.raw.browser_download_url)
  } else {
    return Backend.prototype.serveAsset.apply(this, arguments)
  }
}

/**
 * Return stream for an asset
 * @param {Asset} asset
 * @return {Promise<Stream>}
 */
GitHubBackend.prototype.getAssetStream = function (asset) {
  const headers = {
    "User-Agent": "nuts",
    Accept: "application/octet-stream",
  }
  let httpAuth

  if (this.opts.token) {
    headers["Authorization"] = "token " + this.opts.token
  } else if (this.opts.username) {
    httpAuth = {
      user: this.opts.username,
      pass: this.opts.password,
      sendImmediately: true,
    }
  }

  return Q(
    request({
      uri: asset.raw.url,
      method: "get",
      headers: headers,
      auth: httpAuth,
    }),
  )
}

module.exports = GitHubBackend
