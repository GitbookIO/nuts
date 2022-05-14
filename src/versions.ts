import semver from "semver";
import { Backend } from "./backends/";
import { PecansRelease } from "./models/PecansRelease";
import { sortRelaseBySemVerDescending } from "./utils/sortRelaseBySemVerDescending";
import { isPlatform, Platform, satisfiesPlatform } from "./utils";
import { UnsupportedPlatformError } from "./pecans";
import { reset } from "express-useragent";

export type PlatformQuery = Platform | undefined;

export interface VersionFilterOpts {
  // latest or a semver range, see: https://github.com/npm/node-semver#ranges, defaults to latest
  versionRange?: string;
  // * or  a channel name, defaults to stable
  channel?: string;
  // defaults to undefined
  platform?: Platform;
}

export class Versions {
  static filterDefaults: VersionFilterOpts = {
    versionRange: "latest",
    platform: undefined,
    channel: "stable",
  };

  constructor(protected backend: Backend) {}

  // Filter versions with criterias
  async filter(opts: VersionFilterOpts): Promise<PecansRelease[]> {
    const _opts: VersionFilterOpts = Object.assign(
      {},
      Versions.filterDefaults,
      opts
    );

    if (_opts.platform !== undefined && !isPlatform(_opts.platform)) {
      throw new UnsupportedPlatformError(_opts.platform);
    }

    const releases = await this.list();

    const matches = releases.filter((release) => {
      if (!release.satisfiesChannel(_opts.channel)) {
        return false;
      }
      // Not available for requested paltform
      if (_opts.platform && _opts.platform !== undefined) {
        const platform: string = _opts.platform;
        const availableForPlatform = release.assets.some((a) => {
          if (a.filename === "RELEASES") return false;
          const match = a.type == _opts.platform || a.type.startsWith(platform);
          return match;
        });
        if (!availableForPlatform) return false;
      }
      const satisfiesSemver = release.satisfiesSemVerRange(_opts.versionRange);
      return satisfiesSemver;
    });
    // console.log({ matches, _opts });

    if (matches.length > 1 && _opts.versionRange == "latest") {
      // depend on sort by release descending to get the latest.
      return [matches[0]];
    }

    return matches;
  }

  //  Get a specific version by its tag
  async get(tag: string) {
    return this.resolve({ versionRange: tag });
  }

  async list() {
    const releases = await this.backend.releases();
    const versions = releases.getReleases();
    return versions.sort(sortRelaseBySemVerDescending);
  }

  // Resolve a platform, by filtering then taking the first result
  async resolve(opts: VersionFilterOpts) {
    const versions = await this.filter(opts);
    if (versions.length === 0)
      throw new Error("Release not found: " + JSON.stringify(opts));

    const version = versions[0];
    return version;
  }
}
