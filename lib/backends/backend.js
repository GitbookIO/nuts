const _ = require("lodash")
const Q = require("q")
const path = require("path")
const os = require("os")
const destroy = require("destroy")
const LRU = require("lru-diskcache")
const streamRes = require("stream-res")
const Buffer = require("buffer").Buffer

const Backend = function (nuts, opts) {
  this.cacheId = 0
  this.nuts = nuts
  this.opts = _.defaults(opts || {}, {
    // Folder to cache assets
    cache: path.resolve(os.tmpdir(), "nuts"),

    // Cache configuration
    cacheMax: 500 * 1024 * 1024,
    cacheMaxAge: 60 * 60 * 1000,
  })

  // Create cache
  this.cache = LRU(opts.cache, {
    max: opts.cacheMax,
    maxAge: opts.cacheMaxAge,
  })

  _.bindAll(this, _.functions(this))
}

// Memoize a function
Backend.prototype.memoize = function (fn) {
  return _.memoize(fn, () => {
    return this.cacheId + Math.ceil(Date.now() / this.opts.cacheMaxAge)
  })
}

// New release? clear cache
Backend.prototype.onRelease = function () {
  this.cacheId++
}

// Initialize the backend
Backend.prototype.init = function () {
  this.cache.init()
  return Q()
}

// List all releases for this repository
Backend.prototype.releases = function () {}

// Return stream for an asset
Backend.prototype.serveAsset = function (asset, req, res) {
  const cacheKey = asset.id

  const outputStream = (stream) => {
    const d = Q.defer()
    streamRes(res, stream, d.makeNodeResolver())
    return d.promise
  }

  res.header("Content-Length", asset.size)
  res.attachment(asset.filename)

  // Key exists
  if (this.cache.has(cacheKey)) {
    return this.cache.getStream(cacheKey).then(outputStream)
  }

  return this.getAssetStream(asset).then((stream) => {
    return Q.all([
      // Cache the stream
      this.cache.set(cacheKey, stream),

      // Send the stream to the user
      outputStream(stream),
    ])
  })
}

// Return stream for an asset
Backend.prototype.getAssetStream = function (asset) {
  return new Promise((res) =>
    res({
      on(x, func) {
        func()
        return this
      },
    }),
  )
}

// Return stream for an asset
Backend.prototype.readAsset = function (asset) {
  return this.getAssetStream(asset).then((res) => {
    const d = Q.defer()
    let output = Buffer.from([])

    const cleanup = () => {
      destroy(res)
      res.removeAllListeners()
    }

    res
      .on("data", (buf) => {
        output = Buffer.concat([output, buf])
      })
      .on("error", (err) => {
        cleanup()
        d.reject(err)
      })
      .on("end", () => {
        cleanup()
        d.resolve(output)
      })

    return d.promise
  })
}

module.exports = Backend
