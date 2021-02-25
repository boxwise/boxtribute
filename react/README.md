# Readme

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="170" height="20" role="img" aria-label="Coverage:branches: 14.12%"><title>Coverage:branches: 14.12%</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="170" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="117" height="20" fill="#555"/><rect x="117" width="53" height="20" fill="#e05d44"/><rect width="170" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="595" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="1070">Coverage:branches</text><text x="595" y="140" transform="scale(.1)" fill="#fff" textLength="1070">Coverage:branches</text><text aria-hidden="true" x="1425" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="430">14.12%</text><text x="1425" y="140" transform="scale(.1)" fill="#fff" textLength="430">14.12%</text></g></svg>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="152" height="20" role="img" aria-label="Coverage:functions: 10%"><title>Coverage:functions: 10%</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="152" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="117" height="20" fill="#555"/><rect x="117" width="35" height="20" fill="#e05d44"/><rect width="152" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="595" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="1070">Coverage:functions</text><text x="595" y="140" transform="scale(.1)" fill="#fff" textLength="1070">Coverage:functions</text><text aria-hidden="true" x="1335" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="250">10%</text><text x="1335" y="140" transform="scale(.1)" fill="#fff" textLength="250">10%</text></g></svg>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="146" height="20" role="img" aria-label="Coverage:lines: 14.29%"><title>Coverage:lines: 14.29%</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="146" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="93" height="20" fill="#555"/><rect x="93" width="53" height="20" fill="#e05d44"/><rect width="146" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="475" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="830">Coverage:lines</text><text x="475" y="140" transform="scale(.1)" fill="#fff" textLength="830">Coverage:lines</text><text aria-hidden="true" x="1185" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="430">14.29%</text><text x="1185" y="140" transform="scale(.1)" fill="#fff" textLength="430">14.29%</text></g></svg>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="182" height="20" role="img" aria-label="Coverage:statements: 13.56%"><title>Coverage:statements: 13.56%</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="182" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="129" height="20" fill="#555"/><rect x="129" width="53" height="20" fill="#e05d44"/><rect width="182" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="655" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="1190">Coverage:statements</text><text x="655" y="140" transform="scale(.1)" fill="#fff" textLength="1190">Coverage:statements</text><text aria-hidden="true" x="1545" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="430">13.56%</text><text x="1545" y="140" transform="scale(.1)" fill="#fff" textLength="430">13.56%</text></g></svg>

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
