# API

A debug API is available to access more infos about releases. This API can be protected by HTTP basic auth (username/password) using configuration `API_USERNAME` and `API_PASSWORD`.

#### List versions:

```
GET http://download.myapp.com/api/versions
```

#### Get details about specific version:

```
GET http://download.myapp.com/api/version/1.1.0
```

#### Resolve a version:

```
GET http://download.myapp.com/api/resolve?platform=osx&channel=alpha
```

#### List channels:

```
GET http://download.myapp.com/api/channels
```
