FROM node:6-alpine

# Setup Container
WORKDIR /app
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["npm", "start"]
EXPOSE 80

# Dumb-init, proper signal handling, and zombie reaping
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Install deps
COPY package.json /app/package.json
RUN npm install --production

# Copy Source
COPY . /app

# Ports
ENV PORT 80
