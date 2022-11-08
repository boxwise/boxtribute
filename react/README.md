# Readme

This front-end project of Boxtribute was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Table of Contents

1. [Contribution Guidelines](../CONTRIBUTING.md)
2. [Development Set-up](#development-set-up)
   1. [Set-up pre-commit](#set-up-pre-commit)
   2. [Install node and yarn](#install-node-and-yarn)
   3. [Linting and Formatting in VSCode](#linting-and-formatting-in-vscode)
3. [Note about yarn and Docker](#note-about-yarn-and-docker)
4. [Testing](#testing)
5. [Conventions for file and folder organisation](#conventions-for-file-and-folder-organisation)

## Development Set-Up

Following the [general set-up steps](../README.md), here a few steps that make your live easier working on the front-end.

### Set-up pre-commit

[Pre-commit](https://pre-commit.com/) enables us to run code quality checks, such as missing semicolons, trailing whitespace, and debug statements, before you are committing your code. We chose pre-commit since it enables us to run these checks for both front-end and back-end in just one place.
The downside is that you need python to be installed on your computer.
Please check the [back-end README](../back/README.md#set-up-pre-commit) to set it up.

### Install node and yarn

For almost all features of our development set-up you should also have [node](https://nodejs.org/en/download/) installed on your computer. You will need it to run front-end tests and the formatters and linters in your IDE(e.g. VSCode).
We recommend you to install node through a [version control like nvm](https://github.com/nvm-sh/nvm). It provides you with much more clarity which version you are running and makes it easy to switch versions of node.

### Linting and Formatting in VSCode

We are using eslint as a linter and prettier as a formatter for the front-end. The configuration of these two is in the [`.prettierrc`-file](../.prettierrc) and [`.eslintrc`-file](../.eslintrc), respectively. There are two extensions for VSCode ([prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [eslint](dbaeumer.vscode-eslint)), which we recommend to to install.

The settings that these extensions are used are already defined in [`.vscode/settings.json`](../.vscode/settings.json).

The following commands need to be run for linting and formatting:

```sh
# auto fix
docker-compose exec react yarn lint

# check formatting
docker-compose exec react yarn format:check

# fix formatting
docker-compose exec react yarn format:write
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

## Note about yarn and Docker

We are using docker to spin up our dev environment. The react folder is in sync with the react Docker container. Therefore, the hot-reloading of the yarn development server should function.

When you wish to add a dependency, e.g. when you make a change to your local `package.json`, you will need to rebuild the docker container and relaunch.

You can add packages during development without rebuilding by installing it inside the container. Your changes will last until you "docker-compose down" and will be saved on host for next build.

For example, to add XYZ to the `package.json` file in the `react` folder while developing, you can run this (make sure you run it in the project's root folder since docker compose is operating in that folder):

      docker-compose exec react yarn add XYZ

Afterwards:

1. stop docker-compose and run `docker-compose up` again
2. run `yarn` in your local react folder (so that your tooling like VSCode also picks up the changes, like new TS types etc)

(This advice has come from https://github.com/BretFisher/node-docker-good-defaults)

## Testing

Testing is done with React Testing Library and Jest.

Test files are located in the same directory as the files they are testing. For example, `CreateBox.test.js` and `CreateBox.tsx` are both located in `react/src/views/CreateBox`.

For integration tests, we mock the Apollo client with a `MockedProvider` component instead of the `ApolloProvider` component that is used to handle real data. More information on mocking the Apollo client can be found [here](https://www.apollographql.com/docs/react/development-testing/testing/).

To eliminate repetitive code, a custom renderer was built in `react/src/utils/test-utils.js`. It allows developers to pass in three arguments (ui, mocks, and history) to render a component in a test environment. The utility also exports the entire react testing library, so you should import from this utility instead of `@testing-library/react`. See `CreateBox.test.js` for examples of the custom renderer's use.

Tests and test coverage can be run with the following command:

```sh
# run tests
docker-compose exec react yarn test

# test coverage
docker-compose exec react yarn test:coverage
```

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

/react
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
├── codegen.yml
├── Dockerfile
├── README.md
├── package.json
├── yarn.lock
├── tsconfig.json
├── .prettierignore
├── .dockerignore
├── .eslintignore
├── .eslintrc
├── .prettierrc
└── .gitignore
```
