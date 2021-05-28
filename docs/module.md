# Use Pecans as a node module

Pecans can be integrated into a Node.JS application as a node module. Using the middleware, you can add custom authentication on downloads or analytics for downloads counts.

#### Installation

Pecans can be installed as a local dependency using `npm`:

```
$ npm install pecans-serve
```

#### Usage

```js
const express = require("express");
const Pecans = require("@dopry/pecans").Pecans;

const app = express();

const pecans = new Pecans({
  // GitHub configuration
  repository: "Me/MyRepo",
  token: "my_api_token",
});

app.use("/myapp", pecans.router);
app.listen(4000);
```

### Configuration

- `cache`: (string) Path to the cache folder, default value is a temprary folder
- `cacheMax`: (int) Max size of the cache (default is 500MB)
- `cacheMaxAge`: (int) Maximum age in ms (default is 1 hour)
- `preFetch`: (boolean) Pre-fetch list of releases at startup (default is true)
- `basePath`: (string) path segment added between the host and the app path to support proxies that rewrite the path without telling express.

GitHub specific configuration:

- `refreshSecret`: (string) Secret for the GitHub webhook

### Hooks

You can bind interceptors (i.e. hooks) to certain asynchronous actions using `pecans.before(fn)` and `pecans.after(fn)`:

- `download`: When an user is downloading a version
- `api`: when an user is accessing the API

```js
pecans.before("download", function (download, next) {
  console.log(
    "user is downloading",
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

pecans.after("download", function (download, next) {
  console.log(
    "user downloaded",
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
```
