# Pecans FAQ

### Can I use a private repository?

Pecans is designed to proxy assets from a private repository to the public.

### Can I use a GitHub Enterprise / GitLab repository?

Since version 3.0.0, Pecans can works with [other backends](https://github.com/dopry/pecans/tree/master/lib/backends) than GitHub. Feel free to post a Pull-Request to implement such backends!

### Can I deploy it to Heroku?

[Yes you can](deploy.md)!

### Can I use it in my Node.js application?

[Yes you can](module.md)!

### What file should I upload to the GitHub release?

Pecans can detect the type of file from its filename, there is no strict policy on file naming. Pecans tries to respect the filename/extension conventions for the different platforms. request:)

- Windows: `.exe`, `.nupkg` etc
- Linux: `.deb`, `.tar.gz`, etc
- OS X: `.dmg`, etc

By default releases are tagged as 32-bits (except for OSX), but 64-bits will also be detected from filenames.

### How should I tag my releases?

Pecans requires applications to follow [SemVer](http://semver.org). And even if you're not using Pecans, you should follow it!

### Does pecans provide an Atom feed of versions?

Yes, [See Feed URLS](./urls.md).
