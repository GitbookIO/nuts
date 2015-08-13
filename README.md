# releaser

> Open source release/application download with auto-updater

This application is a simple release server to download specific or latest version of a desktop application. It uses GitHub releases as a backend, so it can easily be deployed to heroku as a stateless service, it also works for GitHub private repositories (useful to store releases of a closed-source application available on GitHub).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

#### Deploy it / Start it

Install dependencies using:

```
$ npm install
```

This service requires to be configured using environment variables:

```
# Access token for the GitHub API (requires permissions to access the repository), you can also use GITHUB_USERNAME and GITHUB_USERNAME
$ export GITHUB_TOKEN=...

# ID for the GitHub repository
export GITHUB_REPOSITORY=Username/MyApp

# Authentication for the private API
export API_USERNAME=hello
export API_PASSWORD=world
```

Then start the application using:

```
$ npm start
```

#### Download urls

* Latest version on detected platform: `http://download.myapp.com/download/latest` or `http://download.myapp.com/download`
* Latest version on specific platform: `http://download.myapp.com/download/latest/osx` or ``http://download.myapp.com/download/osx`
* Specific version on detected platform: `http://download.myapp.com/download/1.1.0`
* Specific version on specific platform: `http://download.myapp.com/download/1.2.0/osx`

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
autoUpdater.setFeedUrl('http://download.myapp.com/update?version=' + app.getVersion() + '&platform='+os.platform() + '_' + os.arch());
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

Get stats about download per platforms:

```
GET http://download.myapp.com/api/stats.platforms
```
