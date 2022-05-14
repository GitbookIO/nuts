import { PecansRelease } from "../models";

// Merge release notes for a list of versions
export function mergeReleaseNotes(
  versions: PecansRelease[],
  includeTag = true
): string {
  return versions.reduce(function (prev: string, release: PecansRelease) {
    if (!release.notes) return prev;
    return (prev += formatReleaseNote(release, includeTag));
  }, "");
}

export function formatReleaseNote(
  release: PecansRelease,
  includeVersion = true
) {
  const notes = release.notes || "No notes";
  return includeVersion ? `## ${release.version}\n\n${notes}\n` : `${notes}\n`;
}
