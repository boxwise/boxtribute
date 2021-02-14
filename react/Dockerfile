# using alpine for smallest docker image
FROM node:14.9-alpine
WORKDIR /app/react
# install packages seperately to use docker build-caching
# so we don't need to re-fetch these if code has changed
# but our package.json hasn't
COPY package*.json yarn.* ./
RUN yarn install

CMD ["yarn", "start"]
