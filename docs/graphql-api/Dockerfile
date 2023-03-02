FROM node:17.8.0-alpine3.15

COPY package.json .
RUN npm install

ENTRYPOINT ["npx", "spectaql"]
