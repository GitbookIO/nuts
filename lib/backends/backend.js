import util from "util";
import path from "path";
import os from "os";
import destroy from "destroy";
import LRU from "lru-diskcache";
import streamRes from "stream-res";
import { Buffer } from "buffer";

const streamResAsync = util.promisify(streamRes);

export class Backend {
  constructor(pecans, opts = {}) {
    const defaults = {
      // Folder to cache assets
      cache: path.resolve(os.tmpdir(), "pecans"),
      // Cache configuration
      cacheMax: 500 * 1024 * 1024,
      cacheMaxAge: 60 * 60 * 1000,
    };
    this.cacheId = 0;
    this.pecans = pecans;
    this.opts = Object.assign({}, defaults, opts);

    // Create cache
    this.cache = LRU(opts.cache, {
      max: opts.cacheMax,
      maxAge: opts.cacheMaxAge,
    });
  }

  // New release? clear cache
  onRelease() {
    this.cacheId++;
  }
  // Initialize the backend
  async init() {
    this.cache.init();
  }
  // List all releases for this repository
  releases() {}

  // Return stream for an asset, serving out of the LRU cache if available.
  async serveAsset(asset, req, res) {
    const cacheKey = asset.id;
    res.header("Content-Length", asset.size);
    res.attachment(asset.filename);
    // fill cache if empty
    if (!this.cache.has(cacheKey)) {
      const stream = await this.getAssetStream(asset);
      // Cache the stream
      await this.cache.set(cacheKey, stream);
    }
    const stream = await this.cache.getStream(cacheKey);
    return streamResAsync(res, stream);
  }
  // Return stream for an asset
  async getAssetStream(asset) {
    throw Error("Abstract Method");
  }

  // Return stream for an asset
  async readAsset(asset) {
    const response = await this.getAssetStream(asset);
    return new Promise((resolve, reject) => {
      let output = Buffer.alloc(0);

      function cleanup() {
        destroy(response);
        response.removeAllListeners();
      }

      response
        .on("data", (buf) => {
          output = Buffer.concat([output, buf]);
        })
        .on("error", (err) => {
          cleanup();
          reject(err);
        })
        .on("end", () => {
          cleanup();
          resolve(output);
        });
    });
  }
}
