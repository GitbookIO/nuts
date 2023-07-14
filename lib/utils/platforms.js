const _ = require("lodash")
const path = require("path")

// Reduce a platfrom id to its type
const platformToType = (platform) => {
  return _.first(platform.split("_"))
}

// Detect and normalize the platform name
const detectPlatform = (platform) => {
  const name = platform.toLowerCase()
  let prefix = "",
    suffix = ""

  // Detect NuGet/Squirrel.Windows files
  if (name == "releases" || hasSuffix(name, ".nupkg"))
    return platforms.WINDOWS_32

  // Detect prefix: osx, widnows or linux
  if (_.includes(name, "win") || hasSuffix(name, ".exe"))
    prefix = platforms.WINDOWS

  if (
    _.includes(name, "linux") ||
    _.includes(name, "ubuntu") ||
    hasSuffix(name, ".deb") ||
    hasSuffix(name, ".rpm") ||
    hasSuffix(name, ".tgz") ||
    hasSuffix(name, ".tar.gz")
  ) {
    if (_.includes(name, "linux_deb") || hasSuffix(name, ".deb")) {
      prefix = platforms.LINUX_DEB
    } else if (_.includes(name, "linux_rpm") || hasSuffix(name, ".rpm")) {
      prefix = platforms.LINUX_RPM
    } else if (
      _.includes(name, "linux") ||
      hasSuffix(name, ".tgz") ||
      hasSuffix(name, ".tar.gz")
    ) {
      prefix = platforms.LINUX
    }
  }

  if (
    _.includes(name, "mac") ||
    _.includes(name, "osx") ||
    name.indexOf("darwin") >= 0 ||
    hasSuffix(name, ".dmg")
  )
    prefix = platforms.OSX

  // Detect suffix: 32 or 64
  if (
    _.includes(name, "32") ||
    _.includes(name, "ia32") ||
    _.includes(name, "i386")
  )
    suffix = "32"
  if (
    _.includes(name, "64") ||
    _.includes(name, "x64") ||
    _.includes(name, "amd64")
  )
    suffix = "64"

  suffix = suffix || (prefix == platforms.OSX ? "64" : "32")
  return _.compact([prefix, suffix]).join("_")
}

const detectPlatformByUserAgent = (useragent) => {
  if (useragent.isMac) return platforms.OSX
  else if (
    useragent.source.indexOf("WOW64") !== -1 ||
    useragent.source.indexOf("Win64") !== -1
  )
    return platforms.WINDOWS_64
  else if (useragent.isWindows) return platforms.WINDOWS
  else if (useragent.isLinux) return platforms.LINUX
  else if (useragent.isLinux64) return platforms.LINUX_64
  else if (useragent.isBot) return platforms.IS_BOT
  else return null
}

const hasSuffix = (str, suffix) => {
  return str.slice(str.length - suffix.length) === suffix
}

// Satisfies a platform
const satisfiesPlatform = (platform, list) => {
  if (_.includes(list, platform)) return true

  // By default, user 32bits version
  if (_.includes(list + "_32", platform)) return true

  return false
}

// Resolve a platform for a version
const resolveForVersion = (version, platformID, opts) => {
  opts = _.defaults(opts || {}, {
    // Order for filetype
    filePreference: [
      ".exe",
      ".dmg",
      ".deb",
      ".rpm",
      ".tgz",
      ".tar.gz",
      ".zip",
      ".nupkg",
    ],
    wanted: null,
  })

  // Prepare file prefs
  if (opts.wanted)
    opts.filePreference = _.uniq([opts.wanted].concat(opts.filePreference))

  // Normalize platform id
  platformID = detectPlatform(platformID)

  return _.chain(version.platforms)
    .filter((pl) => {
      return pl.type.indexOf(platformID) === 0
    })
    .sort((p1, p2) => {
      let result = 0

      // Compare by arhcitecture ("osx_64" > "osx")
      if (p1.type.length > p2.type.length) result = -1
      else if (p2.type.length > p1.type.length) result = 1

      // Order by file type if samee architecture
      if (result == 0) {
        const ext1 = path.extname(p1.filename)
        const ext2 = path.extname(p2.filename)
        let pos1 = _.indexOf(opts.filePreference, ext1)
        let pos2 = _.indexOf(opts.filePreference, ext2)

        pos1 = pos1 == -1 ? opts.filePreference.length : pos1
        pos2 = pos2 == -1 ? opts.filePreference.length : pos2

        if (pos1 < pos2) result = -1
        else if (pos2 < pos1) result = 1
      }
      return result
    })
    .first()
    .value()
}

const platforms = {
  LINUX: "linux",
  LINUX_32: "linux_32",
  LINUX_64: "linux_64",
  LINUX_RPM: "linux_rpm",
  LINUX_RPM_32: "linux_rpm_32",
  LINUX_RPM_64: "linux_rpm_64",
  LINUX_DEB: "linux_deb",
  LINUX_DEB_32: "linux_deb_32",
  LINUX_DEB_64: "linux_deb_64",
  OSX: "osx",
  OSX_32: "osx_32",
  OSX_64: "osx_64",
  WINDOWS: "windows",
  WINDOWS_32: "windows_32",
  WINDOWS_64: "windows_64",
  IS_BOT: "osx",

  detect: detectPlatform,
  detectPlatformByUserAgent: detectPlatformByUserAgent,
}

module.exports = platforms
module.exports.satisfies = satisfiesPlatform
module.exports.toType = platformToType
module.exports.resolve = resolveForVersion
