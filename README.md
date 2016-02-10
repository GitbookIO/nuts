# Nuts

Nuts is a simple (and smart) application to serve desktop-application releases.

![Schema](./schema.png)

It uses GitHub as a backend to store assets, and it can easily be deployed to Heroku as a stateless service. It supports GitHub private repositories (useful to store releases of a closed-source application available on GitHub).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

#### Features

- :sparkles: Store assets on GitHub releases
- :sparkles: Proxy releases from private repositories to your users
- :sparkles: Simple but powerful download urls
    - `/download/latest`
    - `/download/latest/:os`
    - `/download/:version`
    - `/download/:version/:os`
    - `/download/channel/:channel`
    - `/download/channel/:channel/:os`
- :sparkles: Support pre-release channels (`beta`, `alpha`, ...)
- :sparkles: Auto-updates with [Squirrel](https://github.com/Squirrel)
    - For Mac using `/update?version=<x.x.x>&platform=osx`
    - For Windows using Squirrel.Windows and Nugets packages
- :sparkles: Private API
- :sparkles: Use it as a middleware: add custom analytics, authentication
- :sparkles: Serve the perfect type of assets: `.zip` for Squirrel.Mac, `.nupkg` for Squirrel.Windows, `.dmg` for Mac users, ...
- :sparkles: Release notes endpoint
    - `/notes/:version`
- :sparkles: Up-to-date releases (GitHub webhooks)

#### Deploy it / Start it

[Follow our guide to deploy Nuts](docs/dpeloy.md).

#### Assets for releases

Nuts uses some filename/extension conventions to serve the correct asset to a specific request:

Platform will be detected from the filename:

- Windows: filename should contain `win`
- Mac/OS X: filename should contain `mac` or `osx`
- Linux: filename should contain `linux`

By default releases are tagged as 32-bits (except for OSX), but 64-bits will also be detected from filenames.

Filetype and usage will be detected from the extension:

- `.dmg` will be served in priority to Mac users
- `.nupkg` will only be served to Squirrel.Windows requests
- Otherwise, `.zip` are advised (Linux, Mac, Windows and Squirrel.Mac)

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

Non-prefixed platform will be resolve to 32 bits (except for OS X).

#### Auto-updater / Squirrel

This server provides an endpoint for [Squirrel auto-updater](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md), it supports both [OS X](docs/update-osx.md) and [Windows](docs/update-windows.md).
