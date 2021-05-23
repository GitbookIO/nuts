# Auto-updater on OS X

Pecans provides a backend for the [Squirrel.Mac](https://github.com/Squirrel/Squirrel.Mac) auto-updater. Squirrel.Mac is integrated by default in [Electron applications](https://github.com/atom/electron).

### Endpoint

The endpoint for **Squirrel.Mac** is `http://download.myapp.com/update/osx/:currentVersion`.

This url requires different parameters to return a correct version: `version` and `platform`.

### Electron Example

For example with Electron's `auto-updater` module:

```js
const app = require("app");
const os = require("os");
const autoUpdater = require("auto-updater");

const platform = os.platform() + "_" + os.arch();
const version = app.getVersion();

autoUpdater.setFeedURL(
  "http://download.myapp.com/update/" + platform + "/" + version
);
```
