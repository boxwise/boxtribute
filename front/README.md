# Readme

This front-end project of Boxtribute was bootstrapped with [Vite](https://vite.dev/).

## Table of Contents

1. [Contribution Guidelines](../CONTRIBUTING.md)
2. [Development Set-up](#development-set-up)
   1. [Set-up pre-commit](#set-up-pre-commit)
   2. [Install node and pnpm](#install-node-and-pnpm)
   3. [Linting and Formatting in VSCode](#linting-and-formatting-in-vscode)
3. [Note about pnpm and Docker](#note-about-pnpm-and-docker)
4. [Testing](#testing)
5. [Conventions for file and folder organisation](#conventions-for-file-and-folder-organisation)
6. [About Apollo](#apollo)
7. [Types and GraphQL](#types-and-graphql)

## Development Set-Up

Following the [general set-up steps](../README.md), here a few steps that make your live easier working on the front-end.

### Install node and pnpm

For almost all features of our development set-up you should also have [node](https://nodejs.org/en/download/) installed on your computer. You will need it to run front-end tests and the formatters and linters in your IDE (e.g. VSCode).

We recommend you to install node through a [version control like nvm](https://github.com/nvm-sh/nvm). It provides you with much more clarity which version you are running and makes it easy to switch versions of node.

To install pnpm, see https://pnpm.io/installation. We recommend either using [npm global install](https://pnpm.io/installation#using-npm) or [Corepack](https://pnpm.io/installation#using-corepack).

### Linting and Formatting in VSCode

We are using eslint as a linter and prettier as a formatter for the front-end. The configuration of these two is in the [`.prettierrc`-file](../.prettierrc) and [`.eslintrc`-file](../.eslintrc), respectively. There are two extensions for VSCode ([prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [eslint](dbaeumer.vscode-eslint)), which we recommend to to install.

The settings that these extensions are used are already defined in [`.vscode/settings.json`](../.vscode/settings.json).

The following commands need to be run for linting and formatting:

```sh
# auto fix
docker compose exec front pnpm lint

# check formatting
docker compose exec front pnpm format:check

# fix formatting
docker compose exec front pnpm format:write
```

### General linting and formatting rules

- 2 space tab
- reject unused expressions and imports
- trailing semicolon
- double quotes
- no deep nesting of loops (no loops in loops in loops)
- no console.log
- no debugger statements
- no vars
- prefer types over interfaces
- interfaces/type should start with "I"

## Note about pnpm and Docker

We are using docker to spin up our dev environment. The front folder is in sync with the front Docker container. Therefore, the hot-reloading of the node development server should function.

When you wish to add a dependency, e.g. when you make a change to your local `package.json`, you will need to rebuild the docker container and relaunch.

You can add packages during development without rebuilding by installing it inside the container. Your changes will last until you `docker compose down` and will be saved on host for next build.

For example, to add XYZ to the `package.json` file in the `front` folder while developing, you can run this (make sure you run it in the project's root folder since docker compose is operating in that folder):

      docker compose exec front pnpm add XYZ

Afterwards:

1. stop docker-compose and run `docker compose up` again
2. run `pnpm i` in your local front folder (so that your tooling like VSCode also picks up the changes, like new TS types etc)

(This advice has come from https://github.com/BretFisher/node-docker-good-defaults)

## About Husky

`husky` is a git hook tool that we use to format and lint staged files on pre-commits. In case you use a version manager tool (e.g. `nvm`, `asdf`), or run into trouble commiting your code, consult https://typicode.github.io/husky/how-to.html#node-version-managers-and-guis.

## Testing

Testing is done with [Playwright](https://playwright.dev/) for application, integration, and component testing.

[Vitest](https://vitest.dev/) is used for standalone TypeScript functions and modules.

We use [Mock Service Worker](https://mswjs.io/) (MSW for short) to mock data in a way that faithfully mimics the real server. It's also very useful to mock GraphQL Schema bits that aren't implemented in the real backend yet to build new features on top of it.

Application test specs are inside the `/tests` folder. Other tests are colocated with the files that are the subject of what is being tested.

See Playwright's docs to see how to make the most of it's API to help you build test cases e.g. [recording tests by using the app](https://playwright.dev/docs/codegen-intro).

### Fixtures and mock data

Mock data is located inside `tests/fixtures.ts`, and usually retrieved from real backend calls to speed up testing and development. As long as both frontend and backend matches the GraphQL Schema, we can be sure that the mocked data will match real data consumed in the app. You can add more fixtures by hand or by using the real API results that you can get from the Network tab inside Devtools in the browser.

To label the fixture/mock data, follow the convention of placing it as `userName: { graphqlOperationName: { modifierEGbaseId: data } }`. Then use it inside the MSW handler at `mswHandlers.ts` (also to export the handler at the bottom of the file).

> [!IMPORTANT]  
> You must place this entry on your `.env` file in order for the tests to run against MSW and mock data in `tests/fixtures.ts`.
>
> `USE_MSW=true`
>
> You might need to bring down the Docker containers, rebuild and start again to pick up the enviroment variable changes.

### Running tests

Tests and test coverage can be run with the following commands:

```sh
# Run tests locally in headless mode (CLI only)
pnpm test

# Run tests in UI mode (opens a Chromium browser to visually run and debug tests)
pnpm test:ui

# test coverage
pnpm test:coverage

# run tests inside Docker
docker compose exec front pnpm test

# test coverage inside Docker
docker compose exec front pnpm test:coverage
```

Here, a list of best practices you should follow when writing front-end tests:

- [Write tests that simulate user behavior rather than single components](https://kentcdodds.com/blog/write-fewer-longer-tests)
- [Use the right queries according to their priorization](https://testing-library.com/docs/queries/about#priority)
- [Maybe use this Browser extension to find the best query](https://chrome.google.com/webstore/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano)

## Mobile functional testing

Using Boxtribute with a mobile device is one of the main use cases, therefore we should do some functional testing of the work we are doing whenever possible.
Check https://developer.chrome.com/docs/devtools/remote-debugging/ to know how to debug local development with your Android phone. For Mac/Safari/iOS you will need a Mac and an iPhone simulator set up.

Alernatively, one can connect to your local dev server through the IP address of your local docker container. Vite prints out the address when you start the server locally with e.g. `docker compose up`

```
front-1    |   VITE v5.4.8
front-1    |
front-1    |   ➜  Local:   http://localhost:3000/
front-1    |   ➜  Network: http://172.27.1.3:3000/
```

However, auth0 will not forward you automatically to the login screen if you try to connect via this address since the auth0-spa-js library requires a 'secure' origin starting with `https://` or a localhost address. In order to connect to your local dev server from another device, it is hence easiest to run a HTTPS tunnel through [ngrok](https://ngrok.com/use-cases/developer-preview) or LocalTunnel. The steps are:

1. create ngrok account
2. install ngrok locally and add an authtoken
3. start a tunnel by `ngrok http http://localhost:3000`
4. Take the generated https address and put it in Auth0 in the "boxtribute-react" application under "Allowed Callback URLs".

## Conventions for file and folder organisation

- Views of react-router paths go into the views folder
- Each view can have it's own folder - which in return can have a local components folder
- Following an "As local as possible, as global as needed" approach: components get only moved into a more global/outer folder if they are used on that level
- No index.ts files, besides the entry file for the app
- Ideally only one component per file
- Files and folders which export a component/view are written UpperCamelCase, with the same name as the actual exported component/view
- Other files (like types.ts, helpers.ts etc) and folders (like providers, utils etc) are written in lowerCamelCase
- Config constants should be UPPERCASE_SNAKES
- GraphQL queries, mutation and subscription **string** have the format UPPERCASE_SNAKES\_<QUERY|MUTATION|SUBSCRIPTION>

## Folders and files structures

The following rules and naming conversions can be used to name files:

```bash
|---- <NameOfComponent>Container.ts # GraphQL string definitions, Business Logic, Data transformation
|
|---- <NameOfComponent>.ts # only UI parts **views**
|---- <NameOfView>ViewContainer.tsx # main entry file the ReactRouter is referring to for a whole page including (maybe) GraphQL string definitions, extraction of URL params, ReactContext definitions (if needed), Business Logic, Data transformation
|---- <NameOfView>Query.ts # if GraphQL definitions are too long and should be singled out
|---- <NameOfView>Utils.ts # definitions of custom Hooks
|---- /components # subcomponents only relevant to this page
|--------<NameOfComponent>Container.ts # GraphQL string definitions, Business Logic, Data transformation
|--------<NameOfComponent>.ts # **only** UI parts
```

The folder structure is as follows:

```bash

/front
├── /src
│   ├── assets
│   ├── components
│   │   ├── <NameOfComponent>
│   │   |    ├── <NameOfComponent>Container.tsx
│   |   |    └── <NameOfComponent>.stories.tsx #storybook component definition
│   |   └── Layout.tsx # main layout
│   ├── mocks
│   ├── providers #context providers
│   ├── types #typescript definitions
│   ├── views
│   │   └── <NameOfComponent>
│   │       ├──components
│   |       └── <NameOfSubComponent>.tsx
│   └── utils
│           ├── base-types.ts
│           ├── helpers.ts
│           ├── queries.ts
│           ├── test-utils.ts
│           └── hooks.ts
├── node_modules
├── .storybook
├── public
├── test
├── App.tsx
├── index.tsx
├── logo.svg
├── serviceWorker.js
├── setupTests.js
├── craco.config.js
├── Dockerfile
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .prettierignore
├── .dockerignore
├── .eslintignore
├── .eslintrc
├── .prettierrc
└── .gitignore
```

## Apollo

Apollo is our client to send GraphQL queries and mutation to the back-end. It can also be used as a local storage for global states. Here, some articles you might want to check out:

- [Apollo Client for State Management](https://www.apollographql.com/blog/apollo-client/caching/dispatch-this-using-apollo-client-3-as-a-state-management-solution/)
- [When to use refetchQueries](https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/)

## Types and GraphQL

As our front-end uses TypeScript to statically type our codebase and has a GraphQL schema as our source of truth for almost all of our data, we should make the most of this by inferring types as much as possible from the schema.

And we do that by using [gql.tada](https://gql-tada.0no.co/), which automagically infer types from a unified schema generated from introspection of our API.

See how it's generated by checking out the root `package.json` command `graphql-gen` and by taking a look at the end of the [GraphQL API section](../back/README.md#graphql-api) in the back-end README.

### Convention for creating new GraphQL Fragments, Mutations, Queries, and Types

- Infer your types as much as possible, preferably from Fragments. And break down Queries and Mutations into composable Fragments whenever possible.
- Prefer to use them locally to where they are consumed. Be it component or project-wise.
- Fragments that compose other fragments that are used across more than one app or package should be placed at `/graphql` in the root of the project. Same for Queries, Mutations, and derived types.
- Create types based on the schema for type hint and casting when inference is not an option.
- Not strictly related, but default to using `type` vs `interface`. Do use `interface` when it makes sense: Classes, library authoring, globals, and complex types which using `type` might not be a good fit.
- Do your due diligence if you see a need to deviate from the above conventions/suggestions. Sometimes throwing an `any` and leaving a `TODO` comment to deliver is more important than getting all the types right.
