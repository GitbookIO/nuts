# Deployment

Nuts can be easily be deployed to a state-less server or PaaS. It only uses the disk as a cache for assets.

### On Heroku:

Heroku is the perfect solution to host a Nuts instance.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

### With docker

Nuts can also be run as a Docker container:

```
docker run -it -p 80:80 -e GITHUB_REPO=username/repo gitbook/nuts
```

### On your own server:

Install dependencies using:

```
$ npm install
```

This service requires to be configured using environment variables:

```
# Set the port for the http service
$ export PORT=6000

# Set the port for the https service (optional)
$ export HTTPSPORT=6001
$ export HTTPS_KEYFILE=<Full Path to Private Key File>
$ export HTTPS_CERTFILE=<Full Path to Public Certificate File>

# Access token for the GitHub API (requires permissions to access the repository)
# If the repository is public you do not need to provide an access token
# you can also use GITHUB_USERNAME and GITHUB_PASSWORD
$ export GITHUB_TOKEN=...

# ID for the GitHub repository
$ export GITHUB_REPO=Username/MyApp

# Authentication for the private API
$ export API_USERNAME=hello
$ export API_PASSWORD=world

# Express's "trust proxy" setting for trusting X-Forwarded-* headers when
# behind a reverse proxy like nginx
# http://expressjs.com/en/guide/behind-proxies.html
$ export TRUST_PROXY=loopback
```

Then start the application using:

```
$ npm start
```
