const express = require("express");
const { v4: uuid } = require("uuid");
const basicAuth = require("basic-auth");
const Analytics = require("analytics-node");
const { Pecans, platforms } = require("../");

const app = express();

const apiAuth = {
  username: process.env.API_USERNAME,
  password: process.env.API_PASSWORD,
};

const segment = process.env.SEGMENT_TOKEN
  ? new Analytics(process.env.SEGMENT_TOKEN)
  : undefined;
const downloadEvent = process.env.ANALYTICS_EVENT_DOWNLOAD || "download";

const opts = {
  repository: process.env.GITHUB_REPO,
  token: process.env.GITHUB_TOKEN,
  endpoint: process.env.GITHUB_ENDPOINT,
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD,
  timeout: process.env.VERSIONS_TIMEOUT,
  cache: process.env.VERSIONS_CACHE,
  refreshSecret: process.env.GITHUB_SECRET,
  proxyAssets: !Boolean(process.env.DONT_PROXY_ASSETS),
  // base path to inject between host and relative path. use for D.O. app service where
  // app is proxied through / api and the original url isn't passed by the proxy.
  basePath: process.env.BASE_PATH,
};

// strip undefined from opts
Object.keys(opts).forEach((key) => opts[key] === undefined && delete opts[key]);

const myPecans = new Pecans(opts);

// Control access to API
myPecans.before("api", function (access, next) {
  if (!apiAuth.username) return next();

  function unauthorized() {
    next(new Error("Invalid username/password for API"));
  }

  const user = basicAuth(access.req);
  if (!user || !user.name || !user.pass) {
    return unauthorized();
  }

  if (user.name === apiAuth.username && user.pass === apiAuth.password) {
    return next();
  } else {
    return unauthorized();
  }
});

// Log download
myPecans.before("download", function (download, next) {
  console.log(
    "download",
    download.platform.filename,
    "for version",
    download.version.tag,
    "on channel",
    download.version.channel,
    "for",
    download.platform.type
  );

  next();
});
myPecans.after("download", function (download, next) {
  console.log(
    "downloaded",
    download.platform.filename,
    "for version",
    download.version.tag,
    "on channel",
    download.version.channel,
    "for",
    download.platform.type
  );

  // Track on segment if enabled
  if (segment) {
    const userId = download.req.query.user;
    // console.log(segment.track, download);
    segment.track({
      event: downloadEvent,
      anonymousId: userId ? null : uuid(),
      userId: userId,
      properties: {
        version: download.version.tag,
        channel: download.version.channel,
        platform: download.platform.type,
        os: platforms.toType(download.platform.type),
      },
    });
  }

  next();
});

if (process.env.TRUST_PROXY) {
  try {
    const trustProxyObject = JSON.parse(process.env.TRUST_PROXY);
    app.set("trust proxy", trustProxyObject);
  } catch (e) {
    app.set("trust proxy", process.env.TRUST_PROXY);
  }
}

app.use(myPecans.router);

// Error handling
app.use(function (req, res, next) {
  res.status(404).send("Page not found");
});
app.use(function (err, req, res, next) {
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

myPecans
  .init()

  // Start the HTTP server
  .then(
    function () {
      const server = app.listen(process.env.PORT || 5000, function () {
        const host = server.address().address;
        const port = server.address().port;

        console.log("Listening at http://%s:%s", host, port);
      });
    },
    function (err) {
      console.log(err.stack || err);
      process.exit(1);
    }
  );
