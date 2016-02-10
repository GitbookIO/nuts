# Nuts FAQ

### Can I use a private repository?

Nuts is designed to proxy assets from a private repository to the public.

### Can I use a GitHub Enterprise / GitLab repository?

Since version 3.0.0, Nuts can works with [other backends](https://github.com/GitbookIO/nuts/tree/master/lib/backends) than GitHub. Feel free to post a Pull-Request to implement such backends!

### Can I deploy it to Heroku?

[Yes you can](deploy.md)!

### What file should I upload to the GitHub release?

Nuts can detect the type of file from its filename, there is no strict policy on file naming. Nuts tries to respect the filename/extension conventions for the different platforms. request:)

- Windows: `.exe`, etc
- Linux: `.deb`, `.tar.gz`, etc
- OS X: `.dmg`, etc
