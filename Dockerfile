# Use the official NodeJS image.
# https://hub.docker.com/_/node
FROM node:18-buster-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install all dependencies.
RUN npm install

# Run the web service on container startup.
CMD [ "npm", "run", "dev"]