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

## Development Set-Up

Following the [general set-up steps](../README.md), here a few steps that make your live easier working on the front-end.

### Set-up pre-commit

[Pre-commit](https://pre-commit.com/) enables us to run code quality checks, such as missing semicolons, trailing whitespace, and debug statements, before you are committing your code. We chose pre-commit since it enables us to run these checks for both front-end and back-end in just one place.
The downside is that you need python to be installed on your computer.
Please check the [back-end README](../flask/README.md#set-up-pre-commit) to set it up.

### Install node and yarn

For almost all features of our development set-up you should also have [node](https://nodejs.org/en/download/) installed on your computer. You will need it to run front-end tests and the formatters and linters in your IDE(e.g. VSCode).
We recommend you to install node through a [version control like nvm](https://github.com/nvm-sh/nvm). It provides you with much more clarity which version you are running and makes it easy to switch versions of node.

### Linting and Formatting in VSCode

We are using eslint as a linter and prettier as a formatter for the front-end. The configuration of these two is in the [`.prettierrc`-file](../.prettierrc) and [`.eslintrc`-file](../.eslintrc), respectively. There are two extensions for VSCode ([prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [eslint](dbaeumer.vscode-eslint)), which we recommend to to install.

The settings that these extensions are used are already defined in [`.vscode/settings.json`](../.vscode/settings.json).

## Note about yarn and Docker

We are using docker to spin up our dev environment. The react folder is in sync with the react Docker container. Therefore, the hot-reloading of the yarn development server should function.

When you wish to add a dependency, e.g. when you make a change to your local `package.json`, you will need to rebuild the docker container and relaunch.

You can add packages during development without rebuilding by installing it inside the container. Your changes will last until you "docker-compose down" and will be saved on host for next build.

For example, to add XYZ to the `package.json` file in the `react` folder while developing, you can run this:

      docker-compose exec react yarn add XYZ

(This advice has come from https://github.com/BretFisher/node-docker-good-defaults)

## Testing

Testing is done with React Testing Library and Jest.

Test files are located in the same directory as the files they are testing. For example, `CreateBox.test.js` and `CreateBox.tsx` are both located in `react/src/views/CreateBox`.

For integration tests, we mock the Apollo client with a `MockedProvider` component instead of the `ApolloProvider` component that is used to handle real data. More information on mocking the Apollo client can be found [here](https://www.apollographql.com/docs/react/development-testing/testing/).

To eliminate repetitive code, a custom renderer was built in `react/src/utils/test-utils.js`. It allows developers to pass in three arguments (ui, mocks, and history) to render a component in a test environment. The utility also exports the entire react testing library, so you should import from this utility instead of `@testing-library/react`. See `CreateBox.test.js` for examples of the custom renderer's use.
