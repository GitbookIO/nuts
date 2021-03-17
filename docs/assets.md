# Upload assets for releases

Nuts uses GitHub Releases and assets to serve the right file to the right user.

See GitHub guides: [About Releases](https://help.github.com/articles/about-releases/) & [Creating Releases](https://help.github.com/articles/creating-releases/).

### Naming

Nuts uses some filename/extension conventions to serve the correct asset to a specific request:

The platform/OS will be detected from the filename:

- Windows: filename should contain `win`
- Mac/OS X: filename should contain `mac` or `osx`
- Linux: filename should contain `linux`

By default releases are tagged as 32-bits (except for OSX), but 64-bits will also be detected from filenames.

Filetype and usage will be detected from the extension:

| Platform | Extensions (sorted by priority) |
| -------- | ---------- |
| Windows | `.exe`, `.nupkg`, `.zip` |
| OS X | `.dmg`, `.zip` |
| Linux | `.deb`, `.rpm`, `.zip` |


### Example

Here is a list of files in one of the latest release of our [GitBook Editor](https://www.gitbook.com/editor):

```
gitbook-editor-5.0.0-beta.10-linux-ia32.deb
gitbook-editor-5.0.0-beta.10-linux-x64.deb
gitbook-editor-5.0.0-beta.10-osx-x64.dmg
gitbook-editor-5.0.0-beta.10-osx-x64.zip
GitBook.Editor.Setup.exe
GitBook_Editor-5.0.0.2010-full.nupkg
RELEASES
```
