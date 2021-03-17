# if you update this version, please update .circleci/config.yml
FROM mhart/alpine-node:14.6.0

# Dumb-init, proper signal handling, and zombie reaping
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Install deps
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production
# Copy source
COPY . ./

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["yarn", "start"]
