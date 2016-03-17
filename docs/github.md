# GitHub Integration

By default Nuts fetch releases from GitHub Releases; but sicne Nuts is caching informations, there might be a delay before the creation of the release and the release being served to users.

To solve this issue, you can setup a webhook between Nuts and GitHub, to notify your nuts instance each time GitHub Releases are updated (created/removed/updated).

### Webhook URL

Add a [GitHub Webhook](https://help.github.com/articles/about-webhooks/) with the url:

```
http://download.myapp.com/refresh`
```

It'll refresh versions cache everytime you update a release on GitHub.

### Secret

The GitHub Webhook secret can be configured as a environment variable on Nuts: `GITHUB_SECRET` (default value is `secret`).
