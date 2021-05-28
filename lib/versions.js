import semver from "semver";
import { detectPlatform, satisfiesPlatform } from "./utils/platforms.js";

// Normalize tag name
function normalizeTag(tag) {
  if (tag[0] == "v") tag = tag.slice(1);
  return tag;
}

// Extract channel of version
function extractChannel(tag) {
  const suffix = tag.split("-")[1];
  if (!suffix) return "stable";

  return suffix.split(".")[0];
}

// Normalize a release to a version
function normalizeVersion(release) {
  // Ignore draft
  if (release.draft) return null;

  let downloadCount = 0;
  const releasePlatforms = release.assets
    .map((asset) => {
      const platform = detectPlatform(asset.name);
      if (!platform) return null;

      downloadCount = downloadCount + asset.download_count;
      return {
        id: String(asset.id),
        type: platform,
        filename: asset.name,
        size: asset.size,
        content_type: asset.content_type,
        raw: asset,
      };
    })
    .filter((i) => !!i);
  return {
    tag: normalizeTag(release.tag_name).split("-")[0],
    channel: extractChannel(release.tag_name),
    notes: release.body || "",
    published_at: new Date(release.published_at),
    platforms: releasePlatforms,
  };
}

// Compare two version
function compareVersions(v1, v2) {
  if (semver.gt(v1.tag, v2.tag)) {
    return -1;
  }
  if (semver.lt(v1.tag, v2.tag)) {
    return 1;
  }
  return 0;
}

export class Versions {
  static filterDefaults = {
    tag: "latest",
    platform: null,
    channel: "stable",
  };
  backend;

  constructor(backend) {
    this.backend = backend;
  }

  // List all channels from releases
  async channels(opts) {
    const versions = await this.list();
    const channels = {};

    versions.forEach((version) => {
      if (!channels[version.channel]) {
        channels[version.channel] = {
          latest: null,
          versions_count: 0,
          published_at: 0,
        };
      }

      channels[version.channel].versions_count += 1;
      if (channels[version.channel].published_at < version.published_at) {
        channels[version.channel].latest = version.tag;
        channels[version.channel].published_at = version.published_at;
      }
    });

    return channels;
  }

  // Filter versions with criterias
  async filter(opts) {
    const _opts = Object.assign({}, Versions.filterDefaults, opts);
    if (_opts.platform) _opts.platform = detectPlatform(_opts.platform);

    const versions = await this.list();
    return versions.filter((version) => {
      // Check channel
      if (_opts.channel != "*" && version.channel != _opts.channel)
        return false;

      const versionPlatforms = version.platforms.map((i) => i.type);
      const availableForPlatform = satisfiesPlatform(
        _opts.platform,
        versionPlatforms
      );
      // Not available for requested paltform
      if (_opts.platform && !availableForPlatform) return false;

      // Check tag satisfies request version
      return _opts.tag == "latest" || semver.satisfies(version.tag, _opts.tag);
    });
  }

  //  Get a specific version by its tag
  async get(tag) {
    return this.resolve({ tag });
  }

  async list() {
    const releases = await this.backend.releases();
    return releases
      .map(normalizeVersion)
      .filter((i) => !!i)
      .sort(compareVersions);
  }

  // Resolve a platform, by filtering then taking the first result
  async resolve(opts) {
    const versions = await this.filter(opts);
    if (!versions.length === 0)
      throw new Error("Version not found: " + opts.tag);

    const version = versions[0];
    return version;
  }
}
