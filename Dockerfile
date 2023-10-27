# Common build stage
FROM node:18-buster-slim as common-build-stage

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN npm install

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

RUN npm run build

CMD ["npm", "run", "start"]