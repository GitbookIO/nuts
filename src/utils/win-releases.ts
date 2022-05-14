import { SemVer } from "semver";
import { stripBom } from "./stripBOM";

// Ordered list of supported channels
// there is an implicit assumptions that windows build numbers map to
// alpha.N = 1000 + N,
// beta.N = 2000 + N
// unstable.N = 3000 + N,
// rc.N = 4000 + N
// I'm not sure if this is a sane assumption, but it is probably something that should be documented.
const CHANNEL_MAGINITUDE = 1000;
const CHANNELS = ["alpha", "beta", "unstable", "rc"];

// RELEASES parsing
const releaseRe = /^([0-9a-fA-F]{40})\s+(\S+)\s+(\d+)[\r]*$/;

export interface SquirrelRelease {
  app?: string;
  sha: string;
  filename: string;
  size: number;
  isDelta: boolean;
  version: string;
  semver: string;
}

// Hash a prerelease
function hashPrerelease(s: readonly (string | number)[] = []): number {
  const [channel, ver] = s;
  if (typeof channel == "string") {
    const chanIdx = CHANNELS.indexOf(channel) + 1;
    const offset = Number(ver || 0);
    return chanIdx * 1000 + offset;
  } else {
    return channel;
  }
}

// Map a semver version to a windows version
export function normVersion(tag: string) {
  const parts = new SemVer(tag);
  let prerelease = "";
  if (parts.prerelease && parts.prerelease.length > 0) {
    prerelease = hashPrerelease(parts.prerelease).toString();
  }

  return (
    [parts.major, parts.minor, parts.patch].join(".") +
    (prerelease ? "." + prerelease : "")
  );
}

// Map a windows version to a semver
export function toSemver(tag: string) {
  const parts = tag.split(".");
  const version = parts.slice(0, 3).join(".");
  const prerelease = Number(parts[3]);

  // semver == windows version
  if (!prerelease) return version;

  const channelId = Math.floor(prerelease / CHANNEL_MAGINITUDE);
  const channel = CHANNELS[channelId - 1];
  const count = prerelease - channelId * CHANNEL_MAGINITUDE;

  return version + "-" + channel + "." + count;
}

// Parse RELEASES file
// https://github.com/Squirrel/Squirrel.Windows/blob/0d1250aa6f0c25fe22e92add78af327d1277d97d/src/Squirrel/ReleaseExtensions.cs#L19
export async function parseRELEASES(
  content: string
): Promise<SquirrelRelease[]> {
  const stripped = stripBom(content);
  const normalizedEOL = stripped.replace("\r\n", "\n");
  const lines = normalizedEOL.split("\n");
  const goodlines = lines.filter((line) => !!releaseRe.exec(line));

  return goodlines.map((line) => {
    const parts = releaseRe.exec(line);
    if (parts == null) {
      throw new Error("Invalid Releases Entry");
    }
    const filename = parts[2] || "";
    const isDelta = filename.indexOf("-full.nupkg") == -1;
    const filenameParts = filename
      .replace(".nupkg", "")
      .replace("-delta", "")
      .replace("-full", "")
      .split(/\.|-/)
      .reverse();

    const version = filenameParts
      .filter(function (x) {
        return /^\d+$/.exec(x);
      })
      .reverse()
      .join(".");
    const sha = parts[1] || "";
    const size = Number(parts[3] || 0);
    const semver = toSemver(version);

    return {
      // TODO: This should probably have a value.
      app: undefined,
      sha,
      filename,
      size,
      isDelta,
      version,
      semver,
    };
  });
}

// Generate a RELEASES file
export function generateRELEASES(entries: SquirrelRelease[]) {
  return entries
    .map((entry) => {
      let filename = entry.filename;

      if (!filename) {
        filename = [
          entry.app,
          entry.version,
          entry.isDelta ? "delta.nupkg" : "full.nupkg",
        ].join("-");
      }

      return [entry.sha, filename, entry.size].join(" ");
    })
    .join("\n");
}
