import should from "should";
import { PecansReleaseDTO } from "../src/models";
import { filenameToOperatingSystem } from "../src/utils/OperatingSystem";
import {
  Architecture,
  filenameToPlatform,
  OperatingSystem,
  PackageFormat,
  Platform,
  platforms,
} from "../src/utils/";
import { resolveReleaseAssetForVersion } from "../src/utils/resolveForVersion";
import { filenameToPackageFormat } from "../src/utils/PackageFormat";
import { filenameToArchitecture } from "../src/utils/Architecture";
import { SupportedFileExtension } from "../src/utils/SupportedFileExtension";

type FilenameResolveTestTuple = [
  filename: string,
  os: OperatingSystem,
  arch: Architecture,
  pkg: PackageFormat | undefined,
  platform: Platform
];

const release: PecansReleaseDTO = {
  version: "v3.3.1",
  channel: "stable",
  published_at: new Date(),
  notes: "",
  assets: [
    {
      id: "1",
      type: "osx_64",
      filename: "test-3.3.1-darwin.dmg",
      size: 1457531,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "osx_64",
      filename: "test-3.3.1-darwin-x64.zip",
      size: 1457531,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "osx_arm64",
      filename: "test-3.3.1-darwin-arm64.dmg",
      size: 1457531,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "osx_arm64",
      filename: "test-3.3.1-darwin-arm64.zip",
      size: 1457531,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "windows_32",
      filename: "atom-1.0.9-delta.nupkg",
      size: 1457531,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "windows_32",
      filename: "atom-1.0.9-full.nupkg",
      size: 78181725,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "linux_32",
      filename: "atom-ia32.tar.gz",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "linux_64",
      filename: "atom-amd64.tar.gz",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "linux_rpm_32",
      filename: "atom-ia32.rpm",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "linux_rpm_64",
      filename: "atom-amd64.rpm",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "2",
      type: "linux_deb_32",
      filename: "atom-ia32.deb",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "1",
      type: "linux_deb_64",
      filename: "atom-amd64.deb",
      size: 71292506,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "1",
      type: "windows_32",
      filename: "atom-windows.zip",
      size: 79815714,
      content_type: "application/zip",
      raw: {},
    },
    {
      id: "1",
      type: "windows_32",
      filename: "AtomSetup.exe",
      size: 78675720,
      content_type: "application/zip",
      raw: {},
    },
  ],
};
const tests: FilenameResolveTestTuple[] = [
  ["myapp-v0.25.1-darwin-x64.zip", "osx", "64", undefined, platforms.OSX_64],
  ["myapp.dmg", "osx", "64", undefined, platforms.OSX_64],
  ["myapp-arm.dmg", "osx", "arm64", undefined, platforms.OSX_ARM64],
  [
    "myapp-v0.25.1-win32-ia32.zip",
    "windows",
    "32",
    undefined,
    platforms.WINDOWS_32,
  ],
  ["atom-1.0.9-delta.nupkg", "windows", "32", undefined, platforms.WINDOWS_32],
  ["RELEASES", "windows", "32", undefined, platforms.WINDOWS_32],
  ["enterprise-amd64.tar.gz", "linux", "64", undefined, platforms.LINUX_64],
  ["enterprise-amd64.tgz", "linux", "64", undefined, platforms.LINUX_64],
  ["enterprise-ia32.tar.gz", "linux", "32", undefined, platforms.LINUX_32],
  ["enterprise-ia32.tgz", "linux", "32", undefined, platforms.LINUX_32],
  ["atom-ia32.deb", "linux", "32", "deb", platforms.LINUX_DEB_32],
  ["atom-amd64.deb", "linux", "64", "deb", platforms.LINUX_DEB_64],
  ["atom-ia32.rpm", "linux", "32", "rpm", platforms.LINUX_RPM_32],
  ["atom-amd64.rpm", "linux", "64", "rpm", platforms.LINUX_RPM_64],
];

const fileNameByPlatformTests: [platform: Platform, filename: string][] = [
  ["osx_64", "test-3.3.1-darwin.dmg"],
  ["osx_arm64", "test-3.3.1-darwin-arm64.dmg"],
  ["windows_32", "AtomSetup.exe"],
  ["linux_64", "atom-amd64.tar.gz"],
  ["linux_32", "atom-ia32.tar.gz"],
  ["linux_rpm_32", "atom-ia32.rpm"],
  ["linux_rpm_64", "atom-amd64.rpm"],
  ["linux_deb_32", "atom-ia32.deb"],
  ["linux_deb_64", "atom-amd64.deb"],
];

const fileNameByPlatformAndExtTests: [
  platform: Platform,
  ext: SupportedFileExtension,
  filename: string
][] = [
  ["osx_64", ".zip", "test-3.3.1-darwin-x64.zip"],
  ["osx_arm64", ".zip", "test-3.3.1-darwin-arm64.zip"],
];

describe("Platforms", function () {
  describe("filenameToOperatingSystem", () => {
    tests.forEach(([filename, os, arch, pkg]) => {
      it(`resolves ${filename} to operating system ${os}`, () => {
        filenameToOperatingSystem(filename).should.be.exactly(os);
      });
    });
  });

  describe("filenameToArchitecture", () => {
    tests.forEach(([filename, os, arch, pkg]) => {
      it(`resolves ${filename} to architecture ${arch}`, () => {
        const os = filenameToOperatingSystem(filename);
        filenameToArchitecture(filename, os).should.be.exactly(arch);
      });
    });
  });

  describe("filenameToPackageFormat", () => {
    tests.forEach(([filename, os, arch, pkg]) => {
      it(`resolves ${filename} to pkg format ${pkg}`, () => {
        const target = filenameToPackageFormat(filename);
        should(target).be.exactly(pkg);
      });
    });
  });

  describe("filenameToPlatform", function () {
    tests.forEach(([filename, os, arch, pkg, platform]) => {
      it(`resolves ${filename} to platform ${platform}`, () => {
        const target = filenameToPlatform(filename);
        should(target).be.exactly(platform);
      });
    });
  });

  describe("resolveReleaseAssetForVersion", function () {
    fileNameByPlatformTests.forEach(([platform, filename]) => {
      it(`resolves ${platform} to ${filename}`, () => {
        const target = resolveReleaseAssetForVersion(release, platform);
        should(target.filename).be.exactly(filename);
      });
    });
    fileNameByPlatformAndExtTests.forEach(([platform, ext, filename]) => {
      it(`resolves ${platform}, ${ext} to ${filename}`, () => {
        const target = resolveReleaseAssetForVersion(release, platform, ext);
        should(target.filename).be.exactly(filename);
      });
    });
  });
});
