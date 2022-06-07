FROM mhart/alpine-node:16

# Switch to /app
WORKDIR /app
# Install deps
COPY package.json ./
RUN npm install --production
# Copy source
COPY . ./

# Ports
ENV PORT 5000
EXPOSE 5000

ENTRYPOINT ["npm", "start"]
