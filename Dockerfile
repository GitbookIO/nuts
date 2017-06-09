FROM node:8-alpine

# Switch to /app
WORKDIR /app
# Install deps
COPY package.json ./
RUN npm install --production
# Copy source
COPY . ./

# Ports
ENV PORT 80
EXPOSE 80

ENTRYPOINT ["npm", "start"]
