const _ = require("lodash")

// Merge release notes for a list of versions
function mergeForVersions(versions, opts) {
  opts = _.defaults(opts || {}, {
    includeTag: true,
  })

  return _.chain(versions)
    .reduce((prev, version) => {
      if (!version.notes) return prev

      // Include tag as title
      if (opts.includeTag) {
        prev = prev + "## " + version.tag + "\n"
      }

      // Include notes
      prev = prev + version.notes + "\n"

      // New lines
      if (opts.includeTag) {
        prev = prev + "\n"
      }

      return prev
    }, "")
    .value()
}

module.exports = {
  merge: mergeForVersions,
}
