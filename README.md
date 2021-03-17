# Nuts

## Project Goals
This is a clone of [GitbookIO/nuts](https://github.com/GitbookIO/nuts) with the goal of staying updated and matained. As of 2021-03-17, all PRs open in [GitbookIO/nuts](https://github.com/GitbookIO/nuts) have been open in this repo. All PRs will be reviewed, updated, then merged (or closed with an explanation). This project may add or removed features in an independent manner from [GitbookIO/nuts](https://github.com/GitbookIO/nuts) with the overarching goal of making it easy to deploy assets behind a proxy.

**Contributions in the form of code, tests, or documentation are appreciated and welcome 😃**

## About

Nuts is a simple (and smart) application to serve desktop-application releases.

![Schema](./docs/schema.png)

It uses GitHub as a backend to store assets, and it can easily be deployed to Heroku as a stateless service. It supports GitHub private repositories (useful to store releases of a closed-source application available on GitHub).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Features

- Store assets on GitHub releases
- Proxy releases from private repositories to your users
- Simple but powerful download urls
    - `/download/latest`
    - `/download/latest/:os`
    - `/download/:version`
    - `/download/:version/:os`
    - `/download/channel/:channel`
    - `/download/channel/:channel/:os`
- Support pre-release channels (`beta`, `alpha`, ...)
- Auto-updates with [Squirrel](https://github.com/Squirrel)
    - For Mac using `/update?version=<x.x.x>&platform=osx`
    - For Windows using Squirrel.Windows and Nugets packages
- Private API
- Use it as a middleware: add custom analytics, authentication
- Serve the perfect type of assets: `.zip` for Squirrel.Mac, `.nupkg` for Squirrel.Windows, `.dmg` for Mac users, ...
- Release notes endpoint
    - `/notes/:version`
- Up-to-date releases (GitHub webhooks)
- Atom/RSS feeds for versions/channels

## Deploy it / Start it

[Guide to deploy Nuts](https://biw.github.io/nuts/deploy).



## Auto-updater / Squirrel

This server provides an endpoint for [Squirrel auto-updater](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md), it supports both [OS X](https://biw.github.io/nuts/update-osx) and [Windows](https://biw.github.io/nuts/update-windows).

## Documentation

[Check out the documentation](https://biw.github.io/nuts/) for more details.

## License
**Apache License 2.0** copyleft [GitbookIO/nuts](https://github.com/GitbookIO/nuts/blob/master/LICENSE)
