import destroy from "destroy";
import { createHash } from "crypto";
import { NextFunction, Request, Response } from "express";
import { Buffer } from "buffer";
import { PecansAsset, PecansAssetDTO } from "../models/PecansAsset";
import { PecansReleases } from "../models";

export interface BackendOpts {
  refreshSecret?: string;
}

export class BackendSettings implements BackendOpts {
  public refreshSecret = undefined;
}

function cleanup(stream: NodeJS.ReadableStream) {
  destroy(stream);
  stream.removeAllListeners();
}

export abstract class Backend {
  // use to salt cache keys to allow updates onRelease().
  protected cacheId = 0;
  protected opts: BackendSettings;
  private hash?: string;

  constructor(opts?: BackendOpts) {
    this.opts = Object.assign({}, new BackendSettings(), opts);
    if (this.opts.refreshSecret) {
      this.hash = createHash("sha256")
        .update(this.opts.refreshSecret)
        .digest("base64");
    }
  }

  // New release? clear cache
  onRelease() {
    this.cacheId++;
  }

  // return an express middlware to catch a specific path
  // ex) `app.use(backend.getRefreshMiddleware('/api/backend/refresh'))`
  getRefreshWebhookMiddleware(
    // path that the firmware will watch.
    path: string
  ): (req: Request, res: Response, nex: NextFunction) => void {
    // the default refresh callback expects a base64 encoded sha256 hash of the refreshSecret.
    // the secret is to prevent DOS attacks against update infrastructure.
    const middleware = (req: Request, res: Response, next: NextFunction) => {
      // on do stuff is a secret was provided, otherwise just call next.
      if (!this.hash) next();
      if (req.path !== path) next();
      if (this.hash != req.params.secret) {
        next("bad secret");
      }
      this.onRelease();
      res.send(200);
    };
    return middleware;
  }

  // List all releases for this repository
  async releases(): Promise<PecansReleases> {
    throw Error("Abstract Method");
  }

  // Return stream for an asset, serving out of the LRU cache if available.
  async serveAsset(asset: PecansAssetDTO, res: Response) {
    throw Error("Abstract Method");
  }
  // Return stream for an asset
  async getAssetStream(
    asset: PecansAsset
  ): Promise<NodeJS.ReadableStream | null> {
    throw Error("Abstract Method");
  }

  // Return stream for an asset
  async readAsset(asset: PecansAsset): Promise<Buffer> {
    const stream = await this.getAssetStream(asset);
    if (stream == null) {
      return Buffer.from("");
    }
    return new Promise((resolve, reject) => {
      let output = Buffer.alloc(0);

      stream
        .on("data", (buf) => {
          output = Buffer.concat([output, buf]);
        })
        .on("error", (err) => {
          cleanup(stream);
          reject(err);
        })
        .on("end", () => {
          cleanup(stream);
          resolve(output);
        });
    });
  }
}
