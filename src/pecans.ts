// @ts-ignore
import urljoin from "urljoin.js";
import { Router, Request, Response, NextFunction } from "express";
import useragent from "express-useragent";

import { VersionFilterOpts, Versions } from "./versions";
import {
  formatReleaseNote,
  mergeReleaseNotes,
} from "./utils/mergeReleaseNotes";
import {
  platforms,
  PLATFORMS,
  Platform,
  isPlatform,
  filenameToPlatform,
  Architecture,
  getPkgFromQuery,
  isOperatingSystem,
  OPERATING_SYSTEMS,
  isValidArchForOS,
} from "./utils/";
import { resolveReleaseAssetForVersion } from "./utils/resolveForVersion";
import { parseRELEASES, generateRELEASES } from "./utils/win-releases";
import { Backend } from "./backends/";
import { ParsedQs } from "qs";
import EventEmitter from "node:events";
import {
  getDownloadExtensionsByOs,
  isSupportedFileExtension,
  SupportedFileExtension,
} from "./utils/SupportedFileExtension";
import {
  PecansReleases,
  PecansRelease,
  PecansAssetDTO,
  PecansReleaseDTO,
  PecansReleaseQuery,
} from "./models/index";
import { validRange } from "semver";

export interface PecansOptions {
  timeout?: number;
  basePath?: string;
  cacheMaxAge?: number;
}

export interface PecansSettings {
  timeout: number;
  basePath: string;
  cacheMaxAge: number;
}

export class UnsupportedPlatformError extends Error {
  constructor(platform: unknown) {
    const platforms = PLATFORMS.join(", ");
    const message = `Unsupported platform (${platform}), expected one of [${platforms}]`;
    super(message);
  }
}

export class UnsupportedChannelError extends Error {
  constructor(channel: unknown) {
    const message = `Unsupported channel (${channel}), expected a single string of 'stable', '*' or a user-defined channel`;
    super(message);
  }
}

export class UnsupportedTagError extends Error {
  constructor(tag: unknown) {
    const message = `Unsupported channel (${tag}), expected a single string`;
    super(message);
  }
}

export function validateReqQueryChannel(
  channel: string | ParsedQs | string[] | ParsedQs[]
): string {
  if (typeof channel !== "string") {
    throw new UnsupportedChannelError(channel);
  }
  return channel;
}

//
export function validateReqQueryPlatform(
  platform: string | ParsedQs | string[] | ParsedQs[] | undefined
): Platform | undefined {
  if (!isPlatform(platform)) throw new UnsupportedPlatformError(platform);
  return platform;
}

export function validateReqQueryTag(
  tag?: string | ParsedQs | string[] | ParsedQs[]
): string | undefined {
  if (tag == undefined) return;
  if (typeof tag !== "string") {
    throw new UnsupportedTagError(tag);
  }
  validRange(tag);
  return tag;
}

export interface ExpressUserAgent {
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isLinux64: boolean;
}
export interface ExpressRequestUserAgent {
  useragent?: useragent.Details;
}

export function getPlatformFromUserAgent(
  req: Request & ExpressRequestUserAgent
) {
  // requires useragent middleware.
  if (!req.useragent) return;
  if (req.useragent.isMac) return platforms.OSX;
  if (req.useragent.isWindows) return platforms.WINDOWS;
  if (req.useragent.isLinux) return platforms.LINUX;
  if (req.useragent.isLinux64) return platforms.LINUX_64;
}
// return a string value from the req.query if it is a single string,
// otherwise return undefined
export function getStringValueFromRequestQuery(
  query: ParsedQs,
  param: string
): string | undefined {
  if (!query[param]) return undefined;
  const value = query[param];
  return typeof value === "string" ? value : undefined;
}

export function getVersionFromQuery(query: ParsedQs): string | undefined {
  const value = getStringValueFromRequestQuery(query, "version");
  return value && (validRange(value) || value == "latest") ? value : undefined;
}

export function getFilenameFromQuery(query: ParsedQs): string | undefined {
  return getStringValueFromRequestQuery(query, "filename");
}

export function getFiletypeFromQuery(
  query: ParsedQs
): SupportedFileExtension | undefined {
  const value = getStringValueFromRequestQuery(query, "filetype");
  if (!value) return undefined;
  const ext = value.startsWith(".") ? value : `.${value}`;
  return isSupportedFileExtension(ext) ? ext : undefined;
}

export function getPlatformFromQuery(query: ParsedQs): Platform | undefined {
  const value = getStringValueFromRequestQuery(query, "platform");
  return value && isPlatform(value) ? value : undefined;
}

export function getArchFromUserAgent(
  useragent?: useragent.Details
): Architecture | undefined {
  // these are arbitrary defaults
  if (!useragent) return;
  if (useragent.isMac) return "64";
  if (useragent.isWindows) return "32";
  if (useragent.isLinux) return "32";
  if (useragent.isLinux64) return "64";
}

export class Pecans extends EventEmitter {
  protected startTime = Date.now();
  protected cacheId = 1;
  protected opts: PecansSettings;

  static defaults: PecansSettings = {
    // Timeout for releases cache (seconds)
    timeout: 60 * 60 * 1000,
    cacheMaxAge: 60 * 60 * 2,
    // Secret for GitHub webhook
    basePath: "",
  };

  protected releasesCache: Record<string, Promise<PecansReleases>> = {};

  public router: Router;

  versions: Versions;

  constructor(
    protected backend: Backend,
    opts: PecansOptions = Pecans.defaults
  ) {
    super();
    this.opts = Object.assign({}, Pecans.defaults, opts);
    if (!this.opts.cacheMaxAge) this.opts.cacheMaxAge = 60 * 60 * 2;
    if (!this.opts.timeout) this.opts.timeout = 60 * 60 * 1000;
    if (!this.opts.basePath) this.opts.basePath = "";

    this.releasesCache[this.getCacheKey()] = backend.releases();

    // Create backend
    this.versions = new Versions(this.backend);
    this.router = Router();

    // Bind routes
    this.router.use(useragent.express());

    // this will need to be called by the backends webhook infrastructure,
    // the semantic will vary by backend.
    this.router.use(
      this.backend.getRefreshWebhookMiddleware("/webhook/refresh")
    );

    // #region download endpoints
    this.router.get("/", this.download.bind(this));
    this.router.get(
      "/download/channel/:channel/:platform?",
      this.download.bind(this)
    );
    this.router.get("/download/:platform?", this.download.bind(this));
    this.router.get("/download/:tag/:filename", this.download.bind(this));
    this.router.get(
      "/download/version/:tag/:platform?",
      this.download.bind(this)
    );

    // the /dl path will supercede the /download/**  paths
    this.router.get("/dl/:filename", this.dlfilename.bind(this));
    // ?channel?os?arch?version
    this.router.get("/dl/:channel/:os/:arch", this.dl.bind(this));
    // #endregion

    this.router.get("/api/channels", this.handleApiChannels.bind(this));
    // ?channel?platform?version
    this.router.get("/api/versions", this.handleApiVersions.bind(this));

    this.router.get("/notes/:version?", this.handleServeNotes.bind(this));
    // @deprecated - the /update endpoint is deprecated, please use /update/:platform/:version
    this.router.get("/update", this.handleUpdateRedirect.bind(this));
    this.router.get(
      "/update/:platform/:version",
      this.handleUpdateOSX.bind(this)
    );
    this.router.get(
      "/update/channel/:channel/:platform/:version",
      this.handleUpdateOSX.bind(this)
    );
    this.router.get(
      "/update/:platform/:version/RELEASES",
      this.handleUpdateWin.bind(this)
    );
    this.router.get(
      "/update/channel/:channel/:platform/:version/RELEASES",
      this.handleUpdateWin.bind(this)
    );
  }

  async dlfilename(req: Request, res: Response, next: NextFunction) {
    try {
      const filename = req.params.filename;
      const query = { filename };
      const releases = await this.getReleases();
      const matchingReleases = releases.queryReleases(query);
      if (matchingReleases.length == 0) {
        res.status(404).send(`${filename} not found`);
      }
      const release = matchingReleases[0];
      const matchingAssets = release.queryAssets(query);
      if (matchingAssets.length == 0) {
        res.status(404).send(`${filename} not found`);
      }
      const asset = matchingAssets[0];
      this.serveAsset(req, res, release, asset);
    } catch (err) {
      next(err);
    }
  }

  async queryReleases(query: PecansReleaseQuery): Promise<PecansRelease[]> {
    const releases = await this.getReleases();
    return releases.queryReleases(query);
  }

  async dl(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = req.params.channel;
      this.validateChannelName(channel);

      const os = req.params.os;
      if (!isOperatingSystem(os)) {
        res
          .status(404)
          .send(
            `Unrecognized OS (${os}) expecting one of ${OPERATING_SYSTEMS.join(
              ", "
            )} `
          );
        return;
      }

      const arch = req.params.arch;
      if (!isValidArchForOS(os, arch)) {
        res.status(404).send(`Unsupported Arch (${arch}) for OS (${os})`);
        return;
      }

      const version = getVersionFromQuery(req.query);
      const pkg = getPkgFromQuery(req.query);

      const releaseQuery: PecansReleaseQuery = {
        channel,
        os,
        arch,
        version,
        pkg,
      };

      const releases = await this.queryReleases(releaseQuery);
      if (releases.length == 0) {
        res.status(404).send("No Matching Releases Found");
        return;
      }
      // releases are sorted in version descending order so the first element
      // should be the highest version that matched the que
      const release = releases[0];
      const extensions = getDownloadExtensionsByOs(os, pkg);
      const assetQuery = { arch, version, pkg, extensions };
      const matchingAssets = release.queryAssets(assetQuery);

      if (matchingAssets.length == 0) {
        res.status(404).send("No Matching Assets Found");
        return;
      }

      const asset = matchingAssets[0];
      this.serveAsset(req, res, release, asset);
    } catch (e) {
      next(e);
    }
  }

  async validateChannelName(name: string): Promise<void> {
    const releases = await this.getReleases();
    const names = releases.getChannelNames();
    if (!names.includes(name)) {
      throw new Error(`Invalid Channel: ${name}`);
    }
  }

  async getChannelFromQuery(query: ParsedQs): Promise<string | undefined> {
    const releases = await this.getReleases();
    const channels = releases.getChannelNames();
    const channel =
      query.channel && typeof query.channel === "string"
        ? query.channel
        : "stable";
    if (channels.includes(channel)) {
      return channel;
    }
    return;
  }

  getCacheKey(): number {
    // use a time based key to ensure the cached releases are update when cacheMaxAge is reached.
    return this.cacheId + Math.ceil(Date.now() / this.opts.cacheMaxAge);
  }

  getFullUrl(req: Request) {
    return (
      req.protocol +
      "://" +
      req.get("host") +
      this.opts.basePath +
      req.originalUrl
    );
  }

  async getReleases(): Promise<PecansReleases> {
    const key = this.getCacheKey();
    if (!this.releasesCache[key]) {
      this.releasesCache[key] = this.backend.releases();
    }
    return this.releasesCache[key];
  }

  async handleApiChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const releases = await this.getReleases();
      const channels = releases.getChannels();
      res.json(channels);
    } catch (err) {
      next(err);
    }
  }

  async handleApiStatus(req: Request, res: Response, next: NextFunction) {
    try {
      res.send({ uptime: (Date.now() - this.startTime) / 1000 });
    } catch (err) {
      next(err);
    }
  }

  async handleApiVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = validateReqQueryChannel(req.query.channel || "*");
      const platform = getPlatformFromQuery(req.query);
      const version = getVersionFromQuery(req.query);
      const opts: VersionFilterOpts = {
        versionRange: version,
        platform,
        channel,
      };

      const versions = await this.versions.filter(opts);
      res.send(versions);
    } catch (err) {
      next(err);
    }
  }

  // Handler for download routes
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      let channel = validateReqQueryChannel(req.query.channel || "stable");
      const tag = validateReqQueryTag(req.query.tag);
      const filename = req.params.filename;
      const filetype = getFiletypeFromQuery(req.query);

      if (filetype && !isSupportedFileExtension(filetype)) {
        throw new Error("Unsupported FileType Requested");
      }

      const _platform = filename
        ? filenameToPlatform(filename)
        : req.params.platform || getPlatformFromUserAgent(req);
      const platform = validateReqQueryPlatform(_platform);
      if (platform == undefined) {
        throw new Error("Platform is required");
      }

      // If specific version, don't enforce a channel
      if (tag != "latest") channel = "*";

      let release: PecansRelease;
      try {
        release = await this.versions.resolve({
          channel: channel,
          platform: platform,
          versionRange: tag,
        });
      } catch (err) {
        if (channel || tag != "latest") throw err;
      }

      release = await this.versions.resolve({
        channel: "*",
        platform: platform,
        versionRange: tag,
      });

      const asset = filename
        ? release.assets.find((i) => i.filename == filename)
        : resolveReleaseAssetForVersion(release, platform, filetype);

      if (!asset)
        throw new Error(
          "No download available for platform " +
            platform +
            " for version " +
            release.version +
            " (" +
            (channel || "beta") +
            ")"
        );

      // Call analytic middleware, then serve
      return this.serveAsset(req, res, release, asset);
    } catch (err) {
      next(err);
    }
  }

  // Request to update
  handleUpdateRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.query.version) throw new Error('Requires "version" parameter');
      if (!req.query.platform) throw new Error('Requires "platform" parameter');
      return res.redirect(
        "/update/" + req.query.platform + "/" + req.query.version
      );
    } catch (err) {
      next(err);
    }
  }

  // Updater used by OSX (Squirrel.Mac) and others
  async handleUpdateOSX(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.version) throw new Error('Requires "version" parameter');
      if (!req.params.platform)
        throw new Error('Requires "platform" parameter');

      const platform = validateReqQueryPlatform(req.params.platform);
      const tag = req.params.version;

      const fullUrl = this.getFullUrl(req);
      const channel = req.params.channel || "*";
      const filetype = req.query.filetype ? req.query.filetype : "zip";

      let versions = await this.versions.filter({
        versionRange: ">=" + tag,
        platform,
        channel,
      });
      if (versions.length === 0) return res.status(204).send("No updates");
      const latest = versions[0];
      if (latest.version == tag) return res.status(204).send("No updates");

      const notesSlice =
        versions.length === 1 ? [latest] : versions.slice(0, -1);
      const releaseNotes = mergeReleaseNotes(notesSlice, false);
      const gitFilePath = channel === "*" ? "/../../../" : "/../../../../../";
      const url = `${fullUrl}/${gitFilePath}/download/version/${latest.version}/${platform}?filetype=${filetype}`;

      res.status(200).send({
        url,
        name: latest.version,
        notes: releaseNotes,
        pub_date: latest.published_at.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  // Update Windows (Squirrel.Windows)
  // Auto-updates: Squirrel.Windows: serve RELEASES from latest version
  // Currently, it will only serve a full.nupkg of the latest release with a normalized filename (for pre-release)
  async handleUpdateWin(req: Request, res: Response, next: NextFunction) {
    try {
      const fullUrl = this.getFullUrl(req);
      const platform = req.params.platform || "windows_32";
      const channel = req.params.channel || "*";
      const tag = req.params.version;

      if (!isPlatform(platform)) {
        throw new Error();
      }

      const versions = await this.versions.filter({
        versionRange: ">=" + tag,
        platform,
        channel,
      });
      if (versions.length === 0) throw new Error("Version not found");

      // Update needed?
      const latest = versions[0];

      // File exists
      const asset = latest.assets.find((i) => i.filename == "RELEASES");
      if (!asset) throw new Error("File not found");

      const content = await this.backend.readAsset(asset);
      let releases = await parseRELEASES(content.toString("utf-8"));
      releases = releases
        // Change filename to use download proxy
        .map((entry) => {
          const gitFilePath =
            channel === "*" ? "../../../../" : "../../../../../../";
          entry.filename = urljoin(
            fullUrl,
            gitFilePath,
            "/download/" + entry.semver + "/" + entry.filename
          );
          return entry;
        });

      const output = generateRELEASES(releases);

      res.header("Content-Length", output.length.toString());
      res.attachment("RELEASES");
      res.send(output);
    } catch (err) {
      next(err);
    }
  }

  // Serve releases notes
  async handleServeNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const version = getVersionFromQuery(req.query);
      const releases = await this.getReleases();
      const query = { version };
      const candidates = releases.queryReleases(query);
      const release = candidates[0];
      const note = formatReleaseNote(release);

      res.format({
        "application/json": function () {
          res.send({
            note,
          });
        },
        default: function () {
          res.send(note);
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Serve an asset to the response
  async serveAsset(
    req: Request,
    res: Response,
    release: PecansReleaseDTO,
    asset: PecansAssetDTO
  ) {
    this.emit("beforeDownload", {
      req: req,
      version: release,
      platform: asset,
    });
    await this.backend.serveAsset(asset, res);
    this.emit("afterDownload", {
      req: req,
      version: release,
      platform: asset,
    });
  }
}
