# GitHub Integration

By default Nuts fetches releases from GitHub Releases; but since Nuts is caching information, there might be a delay before the creation of the release and the release being served to users.

To solve this issue, you can setup a webhook between Nuts and GitHub, to notify your nuts instance each time GitHub Releases are updated (created/removed/updated).

### Webhook URL

Add a [GitHub Webhook](https://help.github.com/articles/about-webhooks/) with the url:

```
http://download.myapp.com/refresh
```

Where download.myapp.com, is the URL of your Nuts server.

It'll refresh versions cache everytime you update a release on GitHub.

### Secret

The GitHub Webhook secret can be configured as a environment variable on Nuts: `GITHUB_SECRET` (default value is `secret`).
