# using alpine for smallest docker image
FROM node:14.18
WORKDIR /app/react
# install packages seperately to use docker build-caching
# so we don't need to re-fetch these if code has changed
# but our package.json hasn't
COPY package*.json yarn.* ./
ENV GENERATE_SOURCEMAP=false

RUN yarn install

CMD ["yarn", "start"]
