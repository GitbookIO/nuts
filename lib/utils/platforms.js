import path from "path";

export const platforms = {
  LINUX: "linux",
  LINUX_32: "linux_32",
  LINUX_64: "linux_64",
  LINUX_RPM: "linux_rpm",
  LINUX_RPM_32: "linux_rpm_32",
  LINUX_RPM_64: "linux_rpm_64",
  LINUX_DEB: "linux_deb",
  LINUX_DEB_32: "linux_deb_32",
  LINUX_DEB_64: "linux_deb_64",
  OSX: "osx",
  OSX_32: "osx_32",
  OSX_64: "osx_64",
  WINDOWS: "windows",
  WINDOWS_32: "windows_32",
  WINDOWS_64: "windows_64",
};

// Reduce a platfrom id to its type
export function platformToType(platform) {
  const [type, bits] = platform.split("_");
  return type;
}

// Detect and normalize the platform name
export function detectPlatform(platform) {
  const name = platform.toLowerCase();
  let prefix = "",
    suffix = "";

  // Detect NuGet/Squirrel.Windows files
  if (name == "releases" || name.endsWith(".nupkg"))
    return platforms.WINDOWS_32;

  // Detect prefix: osx, widnows or linux
  if (name.includes("win") || name.endsWith(".exe")) prefix = platforms.WINDOWS;

  if (
    name.includes("linux") ||
    name.includes("ubuntu") ||
    name.endsWith(".deb") ||
    name.endsWith(".rpm") ||
    name.endsWith(".tgz") ||
    name.endsWith(".tar.gz")
  ) {
    if (name.includes("linux_deb") || name.endsWith(".deb")) {
      prefix = platforms.LINUX_DEB;
    } else if (name.includes("linux_rpm") || name.endsWith(".rpm")) {
      prefix = platforms.LINUX_RPM;
    } else if (
      name.includes("linux") ||
      name.endsWith(".tgz") ||
      name.endsWith(".tar.gz")
    ) {
      prefix = platforms.LINUX;
    }
  }

  if (
    name.includes("mac") ||
    name.includes("osx") ||
    name.indexOf("darwin") >= 0 ||
    name.endsWith(".dmg")
  )
    prefix = platforms.OSX;

  // Detect suffix: 32 or 64
  if (name.includes("32") || name.includes("ia32") || name.includes("i386"))
    suffix = "32";
  if (name.includes("64") || name.includes("x64") || name.includes("amd64"))
    suffix = "64";

  suffix = suffix || (prefix == platforms.OSX ? "64" : "32");
  return `${prefix}_${suffix}`;
}

// Satisfies a platform
export function satisfiesPlatform(platform, list) {
  // By default, use 32bit version
  return list.includes(platform) || (list + "_32").includes(platform);
}

// Resolve a platform for a version
export function resolveForVersion(version, platformID, opts) {
  const defaults = {
    // Order for filetype
    filePreference: [
      ".exe",
      ".dmg",
      ".deb",
      ".rpm",
      ".tgz",
      ".tar.gz",
      ".zip",
      ".nupkg",
    ],
    // specific extension desired
    wanted: null,
  };
  const _opts = Object.assign({}, defaults, opts);

  // Prioritized the wanted extenrion in the file prefs
  if (_opts.wanted) _opts.filePreference.unshift(_opts.wanted);

  // Normalize platform id
  platformID = detectPlatform(platformID);

  return version.platforms
    .filter(function (pl) {
      return pl.type.indexOf(platformID) === 0;
    })
    .sort(function (p1, p2) {
      let result = 0;

      // Compare by arhcitecture ("osx_64" > "osx")
      if (p1.type.length > p2.type.length) result = -1;
      else if (p2.type.length > p1.type.length) result = 1;

      // Order by file type if samee architecture
      if (result == 0) {
        const ext1 = path.extname(p1.filename);
        const ext2 = path.extname(p2.filename);
        let pos1 = _opts.filePreference.indexOf(ext1);
        let pos2 = _opts.filePreference.indexOf(ext2);

        pos1 = pos1 == -1 ? _opts.filePreference.length : pos1;
        pos2 = pos2 == -1 ? _opts.filePreference.length : pos2;

        if (pos1 < pos2) result = -1;
        else if (pos2 < pos1) result = 1;
      }
      return result;
    })[0];
}
