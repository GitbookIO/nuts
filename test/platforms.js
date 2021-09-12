import "should";
import {
  platforms,
  detectPlatform,
  resolveForVersion,
} from "../lib/utils/platforms.js";

describe("Platforms", function () {
  describe("Detect", function () {
    it("should detect osx_64", function () {
      detectPlatform("myapp-v0.25.1-darwin-x64.zip").should.be.exactly(
        platforms.OSX_64
      );
      detectPlatform("myapp.dmg").should.be.exactly(platforms.OSX_64);
    });

    it("should detect osx_arm64", function () {
      detectPlatform("myapp-v0.25.1-darwin-arm64.zip").should.be.exactly(
        platforms.OSX_ARM64
      );
      detectPlatform("myapp-arm.dmg").should.be.exactly(platforms.OSX_ARM64);
    });

    it("should detect windows_32", function () {
      detectPlatform("myapp-v0.25.1-win32-ia32.zip").should.be.exactly(
        platforms.WINDOWS_32
      );
      detectPlatform("atom-1.0.9-delta.nupkg").should.be.exactly(
        platforms.WINDOWS_32
      );
      detectPlatform("RELEASES").should.be.exactly(platforms.WINDOWS_32);
    });

    it("should detect linux", function () {
      detectPlatform("enterprise-amd64.tar.gz").should.be.exactly(
        platforms.LINUX_64
      );
      detectPlatform("enterprise-amd64.tgz").should.be.exactly(
        platforms.LINUX_64
      );
      detectPlatform("enterprise-ia32.tar.gz").should.be.exactly(
        platforms.LINUX_32
      );
      detectPlatform("enterprise-ia32.tgz").should.be.exactly(
        platforms.LINUX_32
      );
    });

    it("should detect debian_32", function () {
      detectPlatform("atom-ia32.deb").should.be.exactly(platforms.LINUX_DEB_32);
    });

    it("should detect debian_64", function () {
      detectPlatform("atom-amd64.deb").should.be.exactly(
        platforms.LINUX_DEB_64
      );
    });

    it("should detect rpm_32", function () {
      detectPlatform("atom-ia32.rpm").should.be.exactly(platforms.LINUX_RPM_32);
    });

    it("should detect rpm_64", function () {
      detectPlatform("atom-amd64.rpm").should.be.exactly(
        platforms.LINUX_RPM_64
      );
    });
  });

  describe("Resolve", function () {
    const version = {
      platforms: [
        {
          type: "osx_64",
          filename: "test-3.3.1-darwin.dmg",
          download_url:
            "https://api.github.com/repos/test/test2/releases/assets/793838",
          download_count: 2,
        },
        {
          type: "osx_64",
          filename: "test-3.3.1-darwin-x64.zip",
          download_url:
            "https://api.github.com/repos/test/test2/releases/assets/793869",
          download_count: 0,
        },
        {
          type: "osx_arm64",
          filename: "test-3.3.1-darwin-arm64.dmg",
          download_url:
            "https://api.github.com/repos/test/test2/releases/assets/793898",
          download_count: 2,
        },
        {
          type: "osx_arm64",
          filename: "test-3.3.1-darwin-arm64.zip",
          download_url:
            "https://api.github.com/repos/test/test2/releases/assets/793899",
          download_count: 0,
        },
        {
          type: "windows_32",
          filename: "atom-1.0.9-delta.nupkg",
          size: 1457531,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825732",
          download_count: 55844,
        },
        {
          type: "windows_32",
          filename: "atom-1.0.9-full.nupkg",
          size: 78181725,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825730",
          download_count: 26987,
        },
        {
          type: "linux_32",
          filename: "atom-ia32.tar.gz",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "linux_64",
          filename: "atom-amd64.tar.gz",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "linux_rpm_32",
          filename: "atom-ia32.rpm",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "linux_rpm_64",
          filename: "atom-amd64.rpm",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "linux_deb_32",
          filename: "atom-ia32.deb",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "linux_deb_64",
          filename: "atom-amd64.deb",
          size: 71292506,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825658",
          download_count: 2494,
        },
        {
          type: "windows_32",
          filename: "atom-windows.zip",
          size: 79815714,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825729",
          download_count: 463,
        },
        {
          type: "windows_32",
          filename: "AtomSetup.exe",
          size: 78675720,
          content_type: "application/zip",
          download_url:
            "https://api.github.com/repos/atom/atom/releases/assets/825728",
          download_count: 5612,
        },
      ],
    };

    it("should resolve to best platform", function () {
      resolveForVersion(version, "osx").filename.should.be.exactly(
        "test-3.3.1-darwin.dmg"
      );
      resolveForVersion(version, "osx_arm64").filename.should.be.exactly(
        "test-3.3.1-darwin-arm64.dmg"
      );
      resolveForVersion(version, "win32").filename.should.be.exactly(
        "AtomSetup.exe"
      );
      resolveForVersion(version, "linux_64").filename.should.be.exactly(
        "atom-amd64.tar.gz"
      );
      resolveForVersion(version, "linux_32").filename.should.be.exactly(
        "atom-ia32.tar.gz"
      );
      resolveForVersion(version, "linux_rpm_32").filename.should.be.exactly(
        "atom-ia32.rpm"
      );
      resolveForVersion(version, "linux_rpm_64").filename.should.be.exactly(
        "atom-amd64.rpm"
      );
      resolveForVersion(version, "linux_deb_32").filename.should.be.exactly(
        "atom-ia32.deb"
      );
      resolveForVersion(version, "linux_deb_64").filename.should.be.exactly(
        "atom-amd64.deb"
      );
    });

    it("should resolve to best platform with a preferred filetype", function () {
      resolveForVersion(version, "osx", {
        filePreference: [".zip"],
      }).filename.should.be.exactly("test-3.3.1-darwin-x64.zip");
    });

    it("should resolve to best platform with a wanted filetype", function () {
      resolveForVersion(version, "osx", {
        wanted: ".zip",
      }).filename.should.be.exactly("test-3.3.1-darwin-x64.zip");
    });

    it("should resolve to best platform with a preferred filetype", function () {
      resolveForVersion(version, "osx_arm64", {
        filePreference: [".zip"],
      }).filename.should.be.exactly("test-3.3.1-darwin-arm64.zip");
    });

    it("should resolve to best platform with a wanted filetype", function () {
      resolveForVersion(version, "osx_arm64", {
        wanted: ".zip",
      }).filename.should.be.exactly("test-3.3.1-darwin-arm64.zip");
    });

  });
});
