# Pecans

Pecans is an Electron Release Server.

## Features

- Download URLS
  - `/download/latest`
  - `/download/latest/:os`
  - `/download/:version`
  - `/download/:version/:os`
  - `/download/channel/:channel`
  - `/download/channel/:channel/:os`
- Auto-updates with [Squirrel](https://github.com/Squirrel)
  - For Mac using Squirrel.Mac `/update?version=<x.x.x>&platform=osx`
    - `/update/:platform/:version`
      `/update/channel/:channel/:platform/:version`
  - For Windows using Squirrel.Windows and Nugets packages
    - `/update/:platform/:version/RELEASES`
    - `/update/channel/:channel/:platform/:version/RELEASES`
- GitHub Release Integration
- GitHub Private Repository Hosted Releases
- GitHub Release Webhook to keep releases up-to-date.
- Release Channels (`beta`, `alpha`, ...)
- Express App (composable)
- Release Noted API, `/notes/:version`
- Atom/RSS feeds for versions/channels

## Deploy it / Start it

[Follow our guide to deploy Pecans](https://pecans.darrelopry.com/v/main/docs/deploy).

## Auto-updater / Squirrel

This server provides an endpoint for [Squirrel auto-updater](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md), it supports both [OS X](https://pecans.darrelopry.com/v/main/docs/update-osx) and [Windows](https://pecans.darrelopry.com/v/main/docs/update-windows).

## Documentation

[Check out the documentation](https://pecans.darrelopry.com/v/main/docs) for more details.

## Acknowledgements

- forked from [Nuts](https://github.com/GitbookIO/nuts).
