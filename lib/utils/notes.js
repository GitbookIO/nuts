// Merge release notes for a list of versions
export function mergeReleaseNotes(versions, opts) {
  const _opts = Object.assign({}, { includeTag: true }, opts);

  return versions.reduce(function (prev, version) {
    if (!version.notes) return prev;

    // Include tag as title
    if (_opts.includeTag) {
      prev = prev + "## " + version.tag + "\n";
    }

    // Include notes
    prev = prev + version.notes + "\n";

    // New lines
    if (_opts.includeTag) {
      prev = prev + "\n";
    }

    return prev;
  }, "");
}
