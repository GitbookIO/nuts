import express, { Request, Response, NextFunction } from "express";
import { GitHubBackend } from "./backends";
import { Pecans, PecansOptions } from "./pecans";

export * from "./backends";
export * from "./pecans";
export * from "./versions";
export * from "./utils/";


if (require.main === module) {
  if (!process.env.GITHUB_TOKEN)
    throw new Error("GITHUB_TOKEN environment variables is required.");
  if (!process.env.GITHUB_OWNER)
    throw new Error("GITHUB_OWNER environment variable is required.");
  if (!process.env.GITHUB_REPO)
    throw new Error("GITHUB_REPO environment variable is required.");

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const backend = new GitHubBackend(token, owner, repo);
  const basePath = process.env.PECANS_BASE_PATH || "";

  const pecansOpts: PecansOptions = {
    // base path to inject between host and relative path. use for D.O. app service where
    // app is proxied through / api and the original url isn't passed by the proxy.
    basePath,
  };

  const pecans = new Pecans(backend, pecansOpts);
  // Log download
  pecans.on("beforeDownload", (download) => {
    console.log(
      "before download",
      download.platform.filename,
      "for version",
      download.version.version,
      "on channel",
      download.version.channel,
      "for",
      download.platform.type
    );
  });
  pecans.on("afterDownload", (download) => {
    console.log(
      "after download",
      download.platform.filename,
      "for version",
      download.version.version,
      "on channel",
      download.version.channel,
      "for",
      download.platform.type
    );
  });
  console.log("listeners", pecans.listeners("beforeDownload"));
  console.log("listeners", pecans.listeners("afterDownload"));

  const port = process.env.PORT || 5000;

  const app = express();
  app.use(pecans.router);
  app.use((req: Request, res: Response, next: NextFunction): void => {
    res.status(404).send("Page not found");
  });
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const msg = err.message || err;
    const code = 500;

    console.error(err.stack || err);

    // Return error
    res.format({
      "text/plain": function () {
        res.status(code).send(msg);
      },
      "text/html": function () {
        res.status(code).send(msg);
      },
      "application/json": function () {
        res.status(code).send({
          error: msg,
          code: code,
        });
      },
    });
  });
  const server = app.listen(port, () => {
    const address = server.address() || "0.0.0.0";

    if (typeof address == "string") {
      console.log(`Lisening at ${address}`);
    } else {
      console.log(
        `Listening at http://${address.address || "0.0.0.0"}:${port}`
      );
    }
  });
}
