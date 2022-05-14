import QueryString from "qs";
import useragent from "express-useragent";

export const OPERATING_SYSTEMS = ["linux", "osx", "windows"] as const;
export type OperatingSystem = typeof OPERATING_SYSTEMS[number];
// check if a string is an OS identifier
export function isOperatingSystem(obj: unknown): obj is OperatingSystem {
  return (
    typeof obj == "string" && OPERATING_SYSTEMS.includes(obj as OperatingSystem)
  );
}

export function filenameToOperatingSystem(filename: string): OperatingSystem {
  const name = filename.toLowerCase();
  // Detect prefix: osx, widnows or linux
  if (
    name == "releases" ||
    name.includes("win32") ||
    name.includes("win64") ||
    name.endsWith(".exe") ||
    name.endsWith(".nupkg")
  )
    return "windows";
  if (
    name.includes("linux") ||
    name.includes("ubuntu") ||
    name.endsWith(".deb") ||
    name.endsWith(".rpm") ||
    name.endsWith(".tgz") ||
    name.endsWith(".tar.gz")
  ) {
    return "linux";
  }
  if (
    name.includes("mac") ||
    name.includes("osx") ||
    name.indexOf("darwin") >= 0 ||
    name.endsWith(".dmg")
  )
    return "osx";
  throw new Error("Unable to determine OS from filename.");
}

export function getOsFromUserAgent(
  useragent?: useragent.Details
): OperatingSystem | undefined {
  if (!useragent) return;
  if (useragent.isMac) return "osx";
  if (useragent.isWindows) return "windows";
  if (useragent.isLinux) return "linux";
  if (useragent.isLinux64) return "linux";
}

export function getOsFromQuery(
  query: QueryString.ParsedQs
): OperatingSystem | undefined {
  return query.os && typeof query.os === "string" && isOperatingSystem(query.os)
    ? query.os
    : undefined;
}
