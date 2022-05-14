import { createHash } from "crypto";
import { Architecture, GithubRelease, GithubReleaseAsset } from "../src";
import { SupportedFileExtension } from "../src/utils/SupportedFileExtension";
type MockGithubReleaseAsset = Pick<
  GithubReleaseAsset,
  "id" | "name" | "size" | "content_type"
>;

interface MockGithubRelease
  extends Pick<GithubRelease, "tag_name" | "body" | "published_at"> {
  assets: MockGithubReleaseAsset[];
}

const DAY_MS = 1000 * 60 * 60 * 24;
const START_STAMP = new Date(2021, 12, 31).getTime();

function mockGithubAssets(
  appname: string,
  tag_names: string[],
  archs: Architecture[],
  extensions: SupportedFileExtension[]
) {
  const releases: MockGithubRelease[] = [];
  const firstReleaseTimestamp = START_STAMP - (tag_names.length + 1) * DAY_MS;
  tag_names.forEach((tag_name, tagIdx) => {
    const assets: MockGithubReleaseAsset[] = [];
    const body = `Notes for ${tag_name}`;
    const published_at = new Date(
      firstReleaseTimestamp + tagIdx * DAY_MS
    ).toISOString();

    archs.forEach((arch, archIdx) => {
      extensions.forEach((ext, extIdx) => {
        const name = `${appname}-${tag_name}-${arch}${ext}`;
        const id = tagIdx * 10000 + archIdx * 1000 + extIdx;
        const asset: MockGithubReleaseAsset = {
          id,
          name,
          size: 100000,
          content_type: "type/mocked",
        };
      });
    });

    const release: MockGithubRelease = {
      tag_name,
      body,
      published_at,
      assets,
    };
    releases.push(release);
  });
}

describe.skip("Integration Tests: Github Backend", () => {
  describe("/webhook/refresh", () => {});
  describe("/", () => {});
  // #region deprecated routes
  describe("/", () => {
    it("autodetects and downloads", () => {});
  });
  describe("/download/channel/:channel/:platform?", () => {});
  describe("/download/version/:tag/:platform?", () => {});
  describe("/download/:tag/:filename", () => {});
  describe("/download/:platform?", () => {});
  describe("/update", () => {
    it("redirects to an update endpoint based on useragent", () => {});
  });
  // #endregion

  describe("/dl/:filename", () => {
    it("requires filename", () => {});
  });
  describe("/dl/:channel/:os/:arch", () => {
    // ?version
    it("requires channel", () => {});
    it("requires os", () => {});
    it("requires arch", () => {});

    it("returns dmg for ");

    it("allows version option", () => {});
    describe("without ?version", () => {});
    describe("with ?version option", () => {
      it("finds matching version", () => {});
      it("returns a 404 if version not matched");
    });
  });

  describe("/api/channels", () => {});
  describe("/api/versions", () => {});
  describe("/notes/:version?", () => {});
  describe("/update/:platform/:version", () => {});
  describe("/update/channel/:channel/:platform/:version", () => {});
  describe("/update/channel/:channel/:platform/:version/RELEASES", () => {});
});
