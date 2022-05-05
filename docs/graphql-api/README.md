Generate static documentation for boxtribute GraphQL API using [spectaql](https://github.com/anvilco/spectaql).

### Configuration files

1. `query-api-config.yml`: Generate documentation only for GraphQL queries and relevant types. Mutations and input types are excluded. Intended for partner organisations who want to retrieve data
1. `full-api-config.yml`: Generate documentation of full GraphQL schema. Intended for internal boxtribute development

Substitute one of these file paths for `some-config.yml` in the command examples below.

### Usage

You can run `spectaql` in your local environment, or via a provided Docker image. Select one of the following acc. to your taste.

First of all change the current directory to `docs/graphql-api/`.

#### Local installation

1. Run `npm install`
1. Execute `npx spectaql some-config.yml`

#### Dockerized installation

1. Build the Docker image with `docker build -t spectaql .` (alpine-based, 280MB)
1. Execute `spectaql` by `./run some-config.yml`

### Result

Open `public/index.html` in the web browser. (Alternatively you can add the `-D` flag to the previous `spectaqle` command to start an HTTP server with file watcher and live reloading on port 4400)

See more options with the `--help` flag, or by inspecting the config files.

### Export

Run `zip -r docs.zip public` and distribute the zip file.
