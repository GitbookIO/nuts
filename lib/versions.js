const _ = require("lodash")
const semver = require("semver")
const createError = require("http-errors")

const platforms = require("./utils/platforms")

/**
 * Normalize a tag name to remove the prefix "v"
 * @param  {String} tag
 * @return {String} tag
 */
const normalizeTag = (tag) => {
  if (tag[0] == "v") tag = tag.slice(1)
  return tag
}

/**
 * Extract channel of tag name
 * @param  {String} tag
 * @return {String} channel
 */
const extractChannel = (tag) => {
  const suffix = tag.split("-")[1]
  if (!suffix) return "stable"

  return suffix.split(".")[0]
}

/**
 * Strip channel from a tag name
 * @param  {String} tag
 * @return {String} tag
 */
const stripChannel = (tag) => {
  return tag.split("-")[0]
}

/**
 * Normalize a release to a version
 * @param  {Object} release
 * @return {Version} version?
 */
const normalizeVersion = (release) => {
  // Ignore draft
  if (release.draft) {
    return null
  }

  let downloadCount = 0
  const releasePlatforms = _.chain(release.assets)
    .map((asset) => {
      const platform = platforms.detect(asset.name)
      if (!platform) return null

      downloadCount = downloadCount + asset.download_count
      return {
        id: String(asset.id),
        type: platform,
        filename: asset.name,
        size: asset.size,
        content_type: asset.content_type,
        raw: asset,
      }
    })
    .compact()
    .value()

  return {
    tag: normalizeTag(release.tag_name),
    channel: extractChannel(release.tag_name),
    notes: release.body || "",
    published_at: new Date(release.published_at),
    platforms: releasePlatforms,
  }
}

/**
 * Compare two version
 * @param  {Version} v1
 * @param  {Version} v2
 * @return {Number}
 */
const compareVersions = (v1, v2) => {
  if (semver.gt(v1.tag, v2.tag)) {
    return -1
  }
  if (semver.lt(v1.tag, v2.tag)) {
    return 1
  }
  return 0
}

const Versions = function (backend) {
  this.backend = backend
}

// List versions normalized
Versions.prototype.list = function () {
  return this.backend.releases().then((releases) => {
    return _.chain(releases)
      .map(normalizeVersion)
      .compact()
      .sort(compareVersions)
      .value()
  })
}

//  Get a specific version by its tag
Versions.prototype.get = function (tag) {
  return this.resolve({
    tag: tag,
  })
}

/**
 * Filter versions with criterias
 * @param  {String} opts.tag? : tag name filter to satisfy (ex: ">=2.0.0")
 * @param  {String} opts.platform? : name of the platform supported by the version
 * @param  {String} opts.channel? : only list version of this channel ("*" for all)
 * @param  {Boolean} opts.stripChannel : compare tag name withotu the channel
 * @return {Promise<Array<Version>>} versions
 */
Versions.prototype.filter = function (opts) {
  opts = _.defaults(opts || {}, {
    tag: "latest",
    platform: null,
    stripChannel: false,
    channel: "stable",
  })

  if (opts.platform) {
    opts.platform = platforms.detect(opts.platform)
  }

  return this.list().then((versions) => {
    return _.chain(versions)
      .filter((version) => {
        // Check channel
        if (opts.channel !== "*" && version.channel != opts.channel) {
          return false
        }

        // Not available for requested platform
        if (
          opts.platform &&
          !platforms.satisfies(opts.platform, _.map(version.platforms, "type"))
        ) {
          return false
        }

        // Check tag satisfies request version
        let tagName = version.tag
        if (opts.stripChannel) {
          tagName = stripChannel(tagName)
        }

        return opts.tag == 'latest' || semver.satisfies(stripChannel(version.tag), stripChannel(opts.tag));
      })
      .value()
  })
}

/**
 * Resolve a platform, by filtering then taking the first result
 * @param  {Object} opts
 * @return {Promise<Version>} version
 */
Versions.prototype.resolve = function (opts) {
  return this.filter(opts).then((versions) => {
    const version = _.first(versions)
    if (!version) {
      throw createError(404, "Version not found: " + opts.tag)
    }

    return version
  })
}

/**
 * List all channels from releases
 * @return {Promise<Channel>}
 */
Versions.prototype.channels = function () {
  return this.list().then((versions) => {
    const channels = {}

    _.each(versions, (version) => {
      if (!channels[version.channel]) {
        channels[version.channel] = {
          latest: null,
          versions_count: 0,
          published_at: 0,
        }
      }

      channels[version.channel].versions_count += 1
      if (channels[version.channel].published_at < version.published_at) {
        channels[version.channel].latest = version.tag
        channels[version.channel].published_at = version.published_at
      }
    })

    return channels
  })
}

module.exports = Versions
