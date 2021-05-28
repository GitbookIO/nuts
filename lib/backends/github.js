import GitHub from "octocat";
import request from "request";
import githubWebhook from "github-webhook-handler";
import fetch from "node-fetch";

import { Backend } from "./backend.js";

export class GitHubBackend extends Backend {
  #releaseMemos = {};
  constructor(pecans, opts) {
    super(pecans, opts);
    const defaults = {
      proxyAssets: true,
    };
    this.opts = Object.assign({}, defaults, this.opts);

    if ((!this.opts.username || !this.opts.password) && !this.opts.token) {
      throw new Error('GitHub backend require "username" and "token" options');
    }
    const octocatOptions = {};
    if (this.opts.token) {
      octocatOptions.token = this.opts.token;
    }
    if (this.opts.endpoint) {
      octocatOptions.endpoint = this.opts.endpoint;
    }
    if (this.opts.username) {
      octocatOptions.user = this.opts.username;
    }
    if (this.opts.password) {
      octocatOptions.password = this.opts.password;
    }

    this.client = new GitHub(octocatOptions);

    this.ghrepo = this.client.repo(this.opts.repository);

    // GitHub webhook to refresh list of versions
    this.webhookHandler = githubWebhook({
      path: "/refresh",
      secret: this.opts.refreshSecret,
    });

    // Webhook from GitHub
    this.webhookHandler.on("release", (event) => {
      this.onRelease();
    });
    this.webhookHandler.on("error", (error) => {
      console.error("webhookHandler", error);
    });
    this.pecans.router.use(this.webhookHandler);
  }
  // List all releases for this repository
  async releases() {
    // use a time based key to ensure the cached releases are update when cacheMaxAge is reached.
    // we should probably use a more general in memory cache with aging in Backend so we don't need this in every implementation.
    const key = this.cacheId + Math.ceil(Date.now() / this.opts.cacheMaxAge);
    if (!this.#releaseMemos[key]) {
      const page = await this.ghrepo.releases();
      this.#releaseMemos[key] = await page.all();
    }
    return this.#releaseMemos[key];
  }
  // Return stream for an asset
  async serveAsset(asset, req, res) {
    if (!this.opts.proxyAssets) {
      res.redirect(asset.raw.browser_download_url);
    } else {
      const redirect = "manual";
      const headers = { Accept: "application/octet-stream" };
      const options = { headers, redirect };
      const finalUrl = asset.raw.url.replace(
        "https://api.github.com/",
        `https://${this.opts.token}@api.github.com/`
      );
      const assetRes = await fetch(finalUrl, options);
      const location = assetRes.headers.get("Location");
      res.redirect(location);
    }
  }
  // Return stream for an asset
  async getAssetStream(asset) {
    const headers = {
      "User-Agent": "pecans",
      Accept: "application/octet-stream",
    };
    let httpAuth;

    if (this.opts.token) {
      headers["Authorization"] = "token " + this.opts.token;
    } else if (this.opts.username) {
      httpAuth = {
        user: this.opts.username,
        pass: this.opts.password,
        sendImmediately: true,
      };
    }

    return request({
      uri: asset.raw.url,
      method: "get",
      headers: headers,
      auth: httpAuth,
    });
  }
}
