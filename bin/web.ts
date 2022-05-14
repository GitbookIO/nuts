import express, { Request, Response, NextFunction } from "express";
import { GitHubBackend, Pecans, PecansOptions } from "../src/";

const app = express();

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

const pecansOpts: PecansOptions = {
  // base path to inject between host and relative path. use for D.O. app service where
  // app is proxied through / api and the original url isn't passed by the proxy.
  basePath: process.env.BASE_PATH || "",
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

if (process.env.TRUST_PROXY) {
  try {
    const trustProxyObject = JSON.parse(process.env.TRUST_PROXY);
    app.set("trust proxy", trustProxyObject);
  } catch (e) {
    app.set("trust proxy", process.env.TRUST_PROXY);
  }
}

app.use(pecans.router);

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
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

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  const address = server.address() || "0.0.0.0";

  if (typeof address == "string") {
    console.log(`Lisening at ${address}`);
  } else {
    console.log(`Listening at http://${address.address || "0.0.0.0"}:${port}`);
  }
});
