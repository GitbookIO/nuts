const util = require("util");
const Feed = require("feed");
const urljoin = require("urljoin.js");
const Understudy = require("understudy");
const express = require("express");
const useragent = require("express-useragent");

const BACKENDS = require("./backends");
const Versions = require("./versions");
const notes = require("./utils/notes");
const platforms = require("./utils/platforms");
const winReleases = require("./utils/win-releases");

class Pecans {
  #initialized;
  startTime = Date.now();

  static defaults = {
    // Backend to use
    backend: "github",
    // Timeout for releases cache (seconds)
    timeout: 60 * 60 * 1000,
    // Pre-fetch list of releases at startup
    preFetch: true,
    // Secret for GitHub webhook
    refreshSecret: "secret",
    basePath: "",
  };

  constructor(opts = {}) {
    Understudy.call(this);
    util.promisify(this.perform);

    this.opts = Object.assign({}, Pecans.defaults, opts);

    // Create router
    this.router = express.Router();

    // Create backend
    this.backend = new (BACKENDS(this.opts.backend))(this, this.opts);
    this.versions = new Versions(this.backend);

    // Bind routes
    this.router.use(useragent.express());

    this.router.get("/", (...args) => this.handleDownload(...args));
    this.router.get("/api/channels", this.hookApi.bind(this), (...args) =>
      this.handleApiChannels(...args)
    );
    this.router.get("/api/refresh", this.hookApi.bind(this), (...args) =>
      this.handleApiRefresh(...args)
    );
    this.router.get("/api/resolve", this.hookApi.bind(this), (...args) =>
      this.handleApiResolve(...args)
    );
    this.router.get("/api/status", this.hookApi.bind(this), (...args) =>
      this.handleApiStatus(...args)
    );
    this.router.get("/api/versions", this.hookApi.bind(this), (...args) =>
      this.handleApiVersions(...args)
    );
    this.router.get("/api/version/:tag", this.hookApi.bind(this), (...args) =>
      this.handleApiVersion(...args)
    );
    this.router.get("/download/channel/:channel/:platform?", (...args) =>
      this.handleDownload(...args)
    );
    this.router.get("/download/:platform?", (...args) =>
      this.handleDownload(...args)
    );
    this.router.get("/download/:tag/:filename", (...args) =>
      this.handleDownload(...args)
    );
    this.router.get("/download/version/:tag/:platform?", (...args) =>
      this.handleDownload(...args)
    );
    this.router.get("/feed/channel/:channel.atom", (...args) =>
      this.handleChannelFeed(...args)
    );
    this.router.get("/notes/:version?", (...args) =>
      this.handleServeNotes(...args)
    );
    this.router.get("/update", (...args) => this.handleUpdateRedirect(...args));
    this.router.get("/update/:platform/:version", (...args) =>
      this.handleUpdate(...args)
    );
    this.router.get("/update/:platform/:version/RELEASES", (...args) =>
      this.handleUpdateWin(...args)
    );
    this.router.get("/update/channel/:channel/:platform/:version", (...args) =>
      this.handleUpdate(...args)
    );
    this.router.get(
      "/update/channel/:channel/:platform/:version/RELEASES",
      (...args) => this.handleUpdateWin(...args)
    );
  }

  // _init does the real init work, initializing backend and prefetching versions
  async init() {
    if (this.#initialized) return this.#initialized;
    this.#initialized = async () => {
      await this.backend.init();
      if (!this.opts.preFetch) return;
      await this.versions.list();
    };
  }

  getFullUrl(req) {
    return (
      req.protocol +
      "://" +
      req.get("host") +
      this.opts.basePath +
      req.originalUrl
    );
  }

  async handleApiChannels(req, res, next) {
    try {
      const channels = await this.versions.channels();
      res.send(channels);
      try {
      } catch (err) {
        next(err);
      }
    } catch (err) {
      next(err);
    }
  }

  async handleApiRefresh(req, res, next) {
    try {
      await this.backend.onRelease(req);
      res.send({ done: true });
    } catch (err) {
      next(err);
    }
  }

  async handleApiResolve(req, res, next) {
    try {
      const versions = await this.versions.resolve({
        channel: req.query.channel,
        platform: req.query.platform,
        tag: req.query.tag,
      });
      res.send(versions);
    } catch (err) {
      next(err);
    }
  }

  async handleApiStatus(req, res, next) {
    try {
      res.send({ uptime: (Date.now() - this.startTime) / 1000 });
    } catch (err) {
      next(err);
    }
  }

  async handleApiVersion(req, res, next) {
    try {
      const versions = this.versions.resolve({
        tag: req.params.tag,
        channel: "*",
      });
      res.send(versions);
    } catch (err) {
      next(err);
    }
  }
  async handleApiVersions(req, res, next) {
    try {
      const versions = await this.versions.filter({
        platform: req.query.platform,
        channel: req.query.channel || "*",
      });
      res.send(versions);
    } catch (err) {
      next(err);
    }
  }

  // Handler for download routes
  async handleDownload(req, res, next) {
    let channel = req.params.channel;
    let platform = req.params.platform;
    const tag = req.params.tag || "latest";
    const filename = req.params.filename;
    const filetype = req.query.filetype;

    // When serving a specific file, platform is not required
    if (!filename) {
      // Detect platform from useragent
      if (!platform) {
        if (req.useragent.isMac) platform = platforms.OSX;
        if (req.useragent.isWindows) platform = platforms.WINDOWS;
        if (req.useragent.isLinux) platform = platforms.LINUX;
        if (req.useragent.isLinux64) platform = platforms.LINUX_64;
      }

      if (!platform)
        return next(
          new Error("No platform specified and impossible to detect one")
        );
    } else {
      platform = null;
    }

    // If specific version, don't enforce a channel
    if (tag != "latest") channel = "*";

    let version;
    try {
      version = await this.versions.resolve({
        channel: channel,
        platform: platform,
        tag: tag,
      });
    } catch (err) {
      if (channel || tag != "latest") throw err;
    }

    try {
      version = await this.versions.resolve({
        channel: "*",
        platform: platform,
        tag: tag,
      });

      let asset;

      if (filename) {
        asset = version.platforms.find((i) => i.filename == filename);
      } else {
        asset = platforms.resolve(version, platform, {
          wanted: filetype ? "." + filetype : null,
        });
      }

      if (!asset)
        throw new Error(
          "No download available for platform " +
            platform +
            " for version " +
            version.tag +
            " (" +
            (channel || "beta") +
            ")"
        );

      // Call analytic middleware, then serve
      return this.serveAsset(req, res, version, asset);
    } catch (err) {
      next(err);
    }
  }

  // Request to update
  handleUpdateRedirect(req, res, next) {
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
  async handleUpdate(req, res, next) {
    try {
      if (!req.params.version) throw new Error('Requires "version" parameter');
      if (!req.params.platform)
        throw new Error('Requires "platform" parameter');

      const platform = platforms.detect(req.params.platform);
      const tag = req.params.version;

      const fullUrl = this.getFullUrl(req);
      const channel = req.params.channel || "*";
      const filetype = req.query.filetype ? req.query.filetype : "zip";

      let versions = await this.versions.filter({
        tag: ">=" + tag,
        platform,
        channel,
      });
      if (versions.length === 0) return res.status(204).send("No updates");
      const latest = versions[0];
      if (latest.tag == tag) return res.status(204).send("No updates");

      const notesSlice =
        versions.length === 1 ? [latest] : versions.slice(0, -1);
      const releaseNotes = notes.merge(notesSlice, { includeTag: false });
      const gitFilePath = channel === "*" ? "/../../../" : "/../../../../../";
      res.status(200).send({
        url: urljoin(
          fullUrl,
          gitFilePath,
          "/download/version/" +
            latest.tag +
            "/" +
            platform +
            "?filetype=" +
            filetype
        ),
        name: latest.tag,
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
  async handleUpdateWin(req, res, next) {
    try {
      await this.init();
      const fullUrl = this.getFullUrl(req);
      const platform = platforms.detect(req.params.platform) || "win_32";
      const channel = req.params.channel || "*";
      const tag = req.params.version;

      const versions = await this.versions.filter({
        tag: ">=" + tag,
        platform,
        channel,
      });
      if (versions.length === 0) throw new Error("Version not found");

      // Update needed?
      const latest = versions[0];

      // File exists
      const asset = latest.platforms.find((i) => i.filename == "RELEASES");
      if (!asset) throw new Error("File not found");

      const content = this.backend.readAsset(asset);
      let releases = winReleases.parse(content.toString("utf-8"));
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

      const output = winReleases.generate(releases);
      res.header("Content-Length", output.length);
      res.attachment("RELEASES");
      res.send(output);
    } catch (err) {
      next(err);
    }
  }

  // Serve releases notes
  async handleServeNotes(req, res, next) {
    try {
      const tag = req.params.version;

      const filter = {
        tag: tag ? ">=" + tag : "*",
        channel: "*",
      };
      const versions = await this.versions.filter(filter);
      if (versions.length == 0) throw new Error("No versions matching");
      const latest = versions[0];

      res.format({
        "text/plain": function () {
          res.send(notes.merge(versions));
        },
        "application/json": function () {
          res.send({
            notes: notes.merge(versions, { includeTag: false }),
            pub_date: latest.published_at.toISOString(),
          });
        },
        default: function () {
          res.send(releaseNotes);
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Serve versions list as RSS
  async handleChannelFeed(req, res, next) {
    try {
      const channel = req.params.channel || "all";
      const channelId = channel === "all" ? "*" : channel;
      const fullUrl = this.getFullUrl(req);

      const feed = new Feed({
        id: "versions/channels/" + channel,
        title: "Versions (" + channel + ")",
        link: fullUrl,
      });

      const versions = await this.versions.filter({
        channel: channelId,
      });
      console.log(channelId);

      versions.forEach((version) => {
        const link = urljoin(
          fullUrl,
          "/../../../",
          "/download/version/" + version.tag
        );
        feed.addItem({
          title: version.tag,
          link,
          description: version.notes,
          date: version.published_at,
          author: [],
        });
      });

      res.set("Content-Type", "application/atom+xml; charset=utf-8");
      res.send(feed.render("atom-1.0"));
    } catch (err) {
      next(err);
    }
  }

  // Control access to the API
  async hookApi(req, res, next) {
    try {
      await this.performAsync("api", {
        req: req,
        res: res,
      });
      next();
    } catch (err) {
      next(err);
    }
  }

  // Perform a hook using promised functions
  async performAsync(name, arg, fn = () => {}) {
    await this.perform(name, arg, async (next) => {
      try {
        await fn.call(this, arg);
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  // Serve an asset to the response
  async serveAsset(req, res, version, asset) {
    await this.init();
    await this.performAsync(
      "download",
      {
        req: req,
        version: version,
        platform: asset,
      },
      () => {
        return this.backend.serveAsset(asset, req, res);
      }
    );
  }
}

module.exports = Pecans;
