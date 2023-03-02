FROM node:19.1-alpine3.15

COPY package.json .
RUN npm install

ENTRYPOINT ["npx", "spectaql"]
