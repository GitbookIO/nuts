# Nuts

> Open source releases/downloads server with auto-updater and GitHub as a backend

Nuts is a simple (and smart) application to serve releases. It uses GitHub Releases as a backend, and it can easily be deployed to Heroku as a stateless service. It supports private repositories (useful to store releases of a closed-source application available on GitHub).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

#### Features

- :sparkles: Store assets on GitHub releases
- :sparkles: Proxy assets from private repositories
- :sparkles: Simple but powerful download urls
    - `/download/latest`
    - `/download/latest/:os`
    - `/download/:version`
    - `/download/:version/:os`
    - `/download/channel/:channel`
    - `/download/channel/:channel/:os`
- :sparkles: Support pre-release channels (`beta`, `alpha`, ...)
- :sparkles: Auto-updater with [Squirrel](https://github.com/Squirrel)
- :sparkles: Private API
- :sparkles: Use it as a middleware: add custom analytics, authentication
- :sparkles: Serve the perfect type of assets: `.zip` for Squirrel and `.dmg` for users

#### Deploy it / Start it

Install dependencies using:

```
$ npm install
```

This service requires to be configured using environment variables:

```
# Set the port for the service
$ export PORT=6000

# Access token for the GitHub API (requires permissions to access the repository)
# you can also use GITHUB_USERNAME and GITHUB_USERNAME
$ export GITHUB_TOKEN=...

# ID for the GitHub repository
$ export GITHUB_REPOSITORY=Username/MyApp

# Authentication for the private API
$ export API_USERNAME=hello
$ export API_PASSWORD=world
```

Then start the application using:

```
$ npm start
```

#### Download urls

Nuts provides urls to access releases assets. These assets are cached on the disk.

* Latest version for detected platform: `http://download.myapp.com/download/latest` or `http://download.myapp.com/download`
* Latest version for specific platform: `http://download.myapp.com/download/latest/osx` or ``http://download.myapp.com/download/osx`
* Specific version for detected platform: `http://download.myapp.com/download/1.1.0`
* Specific version for specific platform: `http://download.myapp.com/download/1.2.0/osx`
* Specific channel: `http://download.myapp.com/download/channel/beta`
* Specific channel for specific platform: `http://download.myapp.com/download/channel/beta/osx`

#### Platforms

Platforms can be detected from user-agent and are normalized to values: `osx`, `osx_32`, `osx_64`, `linux`, `linux_32`, `linux_64`, `windows`, `windows_32`, `windows_64`.

Non-prefixed platform will be resolve to 32 bits.

#### Auto-updater / Squirrel

This server provides an endpoint for [Squirrel auto-updater](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md): `http://download.myapp.com/update`.

This url requires different query parameters to return a correct version: `version` and `platform`.

For example with Electron:

```js
var app = require('app');
var os = require('os');
var autoUpdater = require('auto-updater');

autoUpdater.setFeedUrl(
    'http://download.myapp.com/update?'
    + 'version=' + app.getVersion()
    + '&platform='+os.platform() + '_' + os.arch()
);
```

#### Private API

A private API is available to access more infos about releases and stats. This API can be protected by HTTP basic auth (username/password) using configuration `API_USERNAME` and `API_PASSWORD`.

List versions:

```
GET http://download.myapp.com/api/versions
```

Get details about specific version:

```
GET http://download.myapp.com/api/version/1.1.0
```

Resolve a version:

```
GET http://download.myapp.com/api/resolve?platform=osx&channel=alpha
```

List channels:

```
GET http://download.myapp.com/api/channels
```

Get stats about downloads:

```
GET http://download.myapp.com/api/stats
```

#### Integrate it as a middleware

Nuts can be integrated into a Node.JS application as a middleware. Using the middleware, you can add custom authentication on downloads or analytics for downloads counts.

```js
var express = require('express');
var Nuts = require('nuts-serve');

var app = express();
var nuts = Nuts(
    // GitHub configuration
    repository: "Me/MyRepo",
    token: "my_api_token",

    // Timeout for releases cache (seconds)
    timeout: 60*60,

    // Folder to cache assets (by default: a temporary folder)
    cache: './assets',

    // Pre-fetch list of releases at startup
    preFetch: true,

    // Middlewares
    onDownload: function(version, req, res, next) {
        console.log('download', download.version.tag, "on channel", download.version.channel, "for", download.platform.type);
        next();
    },
    onAPIAccess: function(req, res, next) {
        next();
    }
);

app.use('/myapp', nuts);

app.listen(4000);
```

