# if you update this version, please update .circleci/config.yml
FROM mhart/alpine-node:14.6.0

# Install deps
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production
# Copy source
COPY . ./

ENTRYPOINT ["yarn", "start"]
