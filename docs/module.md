# Use Nuts as a node module

Nuts can be integrated into a Node.JS application as a node module. Using the middleware, you can add custom authentication on downloads or analytics for downloads counts.

#### Installation

Nuts can be installed as a local dependency using `npm`:

```
$ npm install nuts-serve
```

#### Usage

```js
var express = require('express');
var Nuts = require('nuts-serve').Nuts;

var app = express();

var nuts = Nuts({
    // GitHub configuration
    repository: "Me/MyRepo",
    token: "my_api_token"
});

app.use('/myapp', nuts.router);
app.listen(4000);
```

### Configuration

- `cache`: (string) Path to the cache folder, default value is a temprary folder
- `cacheMax`: (int) Max size of the cache (default is 500MB)
- `cacheMaxAge`: (int) Maximum age in ms (default is 1 hour)
- `preFetch`: (boolean) Pre-fetch list of releases at startup (default is true)

GitHub specific configuration:

- `refreshSecret`: (string) Secret for the GitHub webhook

