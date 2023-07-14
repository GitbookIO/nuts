const _ = require("lodash")
const Q = require("q")
const Feed = require("feed")
const urljoin = require("urljoin.js")
const Understudy = require("understudy")
const express = require("express")
const useragent = require("express-useragent")
const createError = require("http-errors")

const BACKENDS = require("./backends")
const Versions = require("./versions")
const notes = require("./utils/notes")
const platforms = require("./utils/platforms")
const winReleases = require("./utils/win-releases")
const API_METHODS = require("./api")
const { log } = require('util');

const getFullUrl = (req) => {
  return req.protocol + "://" + req.get("host") + req.originalUrl
}

const Nuts = function Nuts(opts) {
  if (!(this instanceof Nuts)) return new Nuts(opts)

  Understudy.call(this)
  _.bindAll(this, _.functions(Nuts))

  this.opts = _.defaults(opts || {}, {
    // Backend to use
    backend: "github",

    // Timeout for releases cache (seconds)
    timeout: 60 * 60 * 1000,

    // Pre-fetch list of releases at startup
    preFetch: true,

    // Secret for GitHub webhook
    refreshSecret: "secret",

    // Prefix for all routes
    routePrefix: "/",
  })

  if (
    this.opts.routePrefix.substr(this.opts.routePrefix.length - 1, 1) !== "/"
  ) {
    throw new Error("ROUTE_PREIX must end with a slash")
  }

  // .init() is now a memoized version of ._init()
  this.init = _.memoize(this._init)

  // Create router
  this.router = express.Router()

  // Create backend
  this.backend = new (BACKENDS(this.opts.backend))(this, this.opts)
  this.versions = new Versions(this.backend)

  // Bind routes
  this.router.use(useragent.express())

  const withPrefix = (s) => `${this.opts.routePrefix}${s}`

  const onDownload = this._onDownload.bind(this)

  this.router.get(withPrefix(""), onDownload)
  this.router.get(
    withPrefix(`download/channel/:channel/:platform?`),
    onDownload,
  )
  this.router.get(withPrefix(`download/version/:tag/:platform?`), onDownload)
  this.router.get(withPrefix(`download/:tag/:filename`), onDownload)
  this.router.get(withPrefix(`download/:platform?`), onDownload)

  this.router.get(
    withPrefix(`feed/channel/:channel.atom`),
    this.onServeVersionsFeed.bind(this),
  )

  this.router.get(withPrefix(`update`), this.onUpdateRedirect.bind(this))
  this.router.get(
    withPrefix(`update/:platform/:version`),
    this.onUpdate.bind(this),
  )
  this.router.get(
    withPrefix(`update/channel/:channel/:platform/:version`),
    this.onUpdate.bind(this),
  )
  this.router.get(
    withPrefix(`update/:platform/:version/RELEASES`),
    this.onUpdateWin.bind(this),
  )
  this.router.get(
    withPrefix(`update/channel/:channel/:platform/:version/RELEASES`),
    this.onUpdateWin.bind(this),
  )
  this.router.get(
    withPrefix(`update/release/:channel/:filename`),
    this.onUpdateRelease.bind(this),
  )

  this.router.get(withPrefix(`notes/:version?`), this.onServeNotes.bind(this))

  // Bind API
  this.router.use(withPrefix(`api`), this.onAPIAccessControl.bind(this))
  _.each(
    API_METHODS,
    (method, route) => {
      this.router.get(withPrefix(`api/${route}`), (req, res, next) => {
        return Q()
          .then(() => {
            return method.call(this, req)
          })
          .then((result) => {
            res.send(result)
          }, next)
      })
    },
    this,
  )
}

// _init does the real init work, initializing backend and prefetching versions
Nuts.prototype._init = function () {
  return Q()
    .then(() => {
      return this.backend.init()
    })
    .then(() => {
      if (!this.opts.preFetch) {
        return
      }

      return this.versions.list()
    })
}

/**
 * Perform a hook using promised functions
 * @param  {String} name
 * @param  {Object} arg
 * @param  {Function} fn
 * @return {Promise<Object>}
 */
Nuts.prototype.performQ = function (name, arg, fn) {
  fn = fn || function () {}

  return Q.nfcall(this.perform, name, arg, (next) => {
    Q()
      .then(() => {
        return fn.call(this, arg)
      })
      .then(() => {
        next()
      }, next)
  })
}

/**
 * Serve an asset to the response
 * @param {Request} req
 * @param {Response} res
 * @param {Version} version
 * @param {String} asset
 * @return {Promise}
 */
Nuts.prototype.serveAsset = function (req, res, version, asset) {
  return this.init().then(() => {
    return this.performQ(
      "download",
      {
        req: req,
        version: version,
        platform: asset,
      },
      () => {
        return this.backend.serveAsset(asset, req, res)
      },
    )
  })
}

Nuts.prototype.onUpdateRelease = function (req, res, next) {
  if (!req.params.channel) throw new Error('Requires "channel" parameter')
  if (!req.params.filename) throw new Error('Requires "filename" parameter')

  const channel = req.params.channel
  const filename = req.params.filename

  const error_msg = `No download available for filename: "${_.escape(filename)}" in channel: "${channel}"`;
  this.versions
    .filter({ channel })
    .then((versions) => {
      const record = _.reduce(versions, (prev, version) => {
          if (!filename || !_.isEmpty(prev.version)) {
            return prev
          }

          const asset = _.find(version.platforms, { filename })

          if (!asset) {
            return prev
          }

          prev.asset = asset
          prev.version = version
          return prev
      }, {})

      const version = record?.version
      const asset = record?.asset

      console.log(asset)

      if (!asset) {
        res.status(404).send(error_msg)
        return
      }

      // Call analytic middleware, then serve
      return this.serveAsset(req, res, version, asset)
    })
    .catch(next)
}

// Handler for download routes
Nuts.prototype._onDownload = function (req, res, next) {
  // If specific version, don't enforce a channel
  let platform = req.params.platform
  const tag = req.params.tag || "latest"
  const channel = tag != "latest" ? "*" : req.params.channel
  const filename = req.params.filename
  const filetypeWanted = req.query.filetype

  // When serving a specific file, platform is not required
  if (!filename) {
    // Detect platform from useragent
    if (!platform) {
      platform = platforms.detectPlatformByUserAgent(req.useragent)
    }
    if (!platform) {
      res.status(400).send("No platform specified and impossible to detect one")
      return
    }
  } else {
    platform = null
  }

  this.versions
    .resolve({
      channel: channel,
      platform: platform,
      tag: tag,
    })
    // Fallback to any channels if no version found on stable one
    .catch((err) => {
      if (channel || tag != "latest") throw err

      return this.versions.resolve({
        channel: "*",
        platform: platform,
        tag: tag,
      })
    })
    // Serve downloads
    .then((version) => {
      console.log(version)
      let asset

      if (filename) {
        asset = _.find(version.platforms, {
          filename: filename,
        })
      } else {
        asset = platforms.resolve(version, platform, {
          wanted: filetypeWanted ? "." + filetypeWanted : null,
        })
      }

      if (!asset) {
        res
          .status(404)
          .send(
            "No download available for platform " +
              _.escape(platform) +
              " for version " +
              version.tag +
              " (" +
              (channel || "beta") +
              ")",
          )
        return
      }

      // Call analytic middleware, then serve
      return this.serveAsset(req, res, version, asset)
    })
    .catch(() => {
      res.status(404).send("No download available for platform " + platform)
    })
}

// Request to update
Nuts.prototype.onUpdateRedirect = function (req, res, next) {
  Q()
    .then(() => {
      if (!req.query.version) throw new Error('Requires "version" parameter')
      if (!req.query.platform) throw new Error('Requires "platform" parameter')

      return res.redirect(
        `${this.opts.routePrefix}update/${req.query.platform}/${req.query.version}`,
      )
    })
    .catch(next)
}

// Updater used by OSX (Squirrel.Mac) and others
Nuts.prototype.onUpdate = function (req, res, next) {
  const fullUrl = getFullUrl(req)

  let platform = req.params.platform
  const channel = req.params.channel || "stable"
  const tag = req.params.version
  const filetype = req.query.filetype ? req.query.filetype : "zip"

  Q()
    .then(() => {
      if (!tag) {
        throw createError(400, 'Requires "version" parameter')
      }
      if (!platform) {
        throw createError(400, 'Requires "platform" parameter')
      }

      platform = platforms.detect(platform)

      return this.versions.filter({
        tag: ">=" + tag,
        platform: platform,
        channel: channel,
        stripChannel: true,
      })
    })
    .then((versions) => {
      const latest = versions[0]

      // Already using latest version?
      if (!latest || latest.tag == tag) {
        return res.status(204).send("No updates")
      }

      // Extract release notes from all versions in range
      const notesSlice =
        versions.length === 1 ? [versions[0]] : versions.slice(0, -1)
      const releaseNotes = notes.merge(notesSlice, { includeTag: false })

      // URL for download should be absolute
      const gitFilePath = req.params.channel ? "/../../../../../" : "/../../../"

      res.status(200).send({
        url: urljoin(
          fullUrl,
          gitFilePath,
          `download/version/${latest.tag}/${platform}?filetype=${filetype}`,
        ),
        name: latest.tag,
        notes: releaseNotes,
        pub_date: latest.published_at.toISOString(),
      })
    })
    .catch(next)
}

// Update Windows (Squirrel.Windows)
// Auto-updates: Squirrel.Windows: serve RELEASES from latest version
// Currently, it will only serve a full.nupkg of the latest release with a normalized filename (for pre-release)
Nuts.prototype.onUpdateWin = function (req, res, next) {
  const fullUrl = getFullUrl(req)
  let platform = "win_32"
  const channel = req.params.channel || "*"
  const tag = req.params.version

  this.init()
    .then(() => {
      platform = platforms.detect(platform)

      return this.versions.filter({
        tag: ">=" + tag,
        platform: platform,
        channel: channel,
      })
    })
    .then((versions) => {
      // Update needed?
      const latest = _.first(versions)
      if (!latest) throw new Error("Version not found")

      // File exists
      const asset = _.find(latest.platforms, {
        filename: "RELEASES",
      })
      if (!asset) throw new Error("File not found")

      return this.backend.readAsset(asset).then((content) => {
        let releases = winReleases.parse(content.toString("utf-8"))

        releases = _.chain(releases)

          // Change filename to use download proxy
          .map((entry) => {
            const gitFilePath =
              channel === "*" ? "../../../../" : "../../../../../../"
            entry.filename = urljoin(
              fullUrl,
              gitFilePath,
              `download/${entry.semver}/${entry.filename}`,
            )

            return entry
          })

          .value()

        const output = winReleases.generate(releases)

        res.header("Content-Length", output.length)
        res.attachment("RELEASES")
        res.send(output)
      })
    })
    .catch(next)
}

// Serve releases notes
Nuts.prototype.onServeNotes = function (req, res, next) {
  const tag = req.params.version

  Q()
    .then(() => {
      return this.versions.filter({
        tag: tag ? ">=" + tag : "*",
        channel: "*",
      })
    })
    .then((versions) => {
      const latest = _.first(versions)
      if (!latest) {
        throw new Error("No versions matching")
      }

      res.format({
        "application/json": function () {
          res.send({
            notes: notes.merge(versions, { includeTag: false }),
            pub_date: latest.published_at.toISOString(),
          })
        },
        default: function () {
          res.send(notes.merge(versions))
        },
      })
    })
    .catch(next)
}

// Serve versions list as RSS
Nuts.prototype.onServeVersionsFeed = function (req, res, next) {
  const channel = req.params.channel || "all"
  const channelId = channel === "all" ? "*" : channel
  const fullUrl = getFullUrl(req)

  const feed = new Feed({
    id: "versions/channels/" + channel,
    title: "Versions (" + channel + ")",
    link: fullUrl,
  })

  Q()
    .then(() => {
      return this.versions.filter({
        channel: channelId,
      })
    })
    .then((versions) => {
      _.each(versions, (version) => {
        feed.addItem({
          title: version.tag,
          link: urljoin(
            fullUrl,
            "/../../../",
            `download/version/${version.tag}`,
          ),
          description: version.notes,
          date: version.published_at,
          author: [],
        })
      })

      res.set("Content-Type", "application/atom+xml; charset=utf-8")
      res.send(feed.render("atom-1.0"))
    })
    .catch(next)
}

// Control access to the API
Nuts.prototype.onAPIAccessControl = function (req, res, next) {
  this.performQ("api", { req: req, res: res }).then(() => {
    next()
  }, next)
}

module.exports = Nuts
