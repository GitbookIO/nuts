import { PecansRelease } from "../models";
import { Platform } from "./platforms";

// Satisfies a platform

export function satisfiesPlatform(platform: Platform, release: PecansRelease) {
  const list = release.assets.map((i) => i.type);
  return list.includes(platform);
}
