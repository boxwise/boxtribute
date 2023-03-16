# using alpine for smallest docker image
# fixed to node version of circleci orb cimg/python:3.10.4-node with yarn version 1.22.5
FROM node:16.19.1

ENV YARN_VERSION 1.22.5

RUN yarn policies set-version $YARN_VERSION

WORKDIR /app/react
# install packages seperately to use docker build-caching
# so we don't need to re-fetch these if code has changed
# but our package.json hasn't
COPY package*.json yarn.* ./
ENV GENERATE_SOURCEMAP=false

RUN yarn install

CMD ["yarn", "start"]
