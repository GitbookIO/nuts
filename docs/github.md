# GitHub Integration

By default Pecans fetches releases from GitHub Releases; but since Pecans is caching information, there might be a delay before the creation of the release and the release being served to users.

To solve this issue, you can setup a webhook between Pecans and GitHub, to notify your pecans instance each time GitHub Releases are updated (created/removed/updated).

### Webhook URL

Add a [GitHub Webhook](https://help.github.com/articles/about-webhooks/) with the url:

```
http://download.myapp.com/refresh
```

Where download.myapp.com, is the URL of your Pecans server.

It'll refresh versions cache everytime you update a release on GitHub.

### Secret

The GitHub Webhook secret can be configured as a environment variable on Pecans: `GITHUB_SECRET` (default value is `secret`).
