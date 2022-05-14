import { prerelease } from "semver";
// Extract channel of version
export function channelFromVersion(version: string): string {
  const components = prerelease(version);
  if (!components) return "stable";
  const [channel] = components;
  return typeof channel == "string" ? channel : "stable";
}
