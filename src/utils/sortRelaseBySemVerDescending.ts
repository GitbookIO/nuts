import { gt } from "semver";
import { PecansRelease } from "../models";

// Compare two version
export function sortRelaseBySemVerDescending(
  a: PecansRelease,
  b: PecansRelease
) {
  if (gt(a.version, b.version)) return -1;
  if (gt(b.version, a.version)) return 1;
  return 0;
}
