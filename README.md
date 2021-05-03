
<a width="105" height="35" href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss" target="_blank" alt="Single Sign On & Token Based Authentication - Auth0">
<img width="105" height="35" alt="JWT Auth for open source projects" src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"></a>

Frontend Test Coverage: [![codecov](https://codecov.io/gh/boxwise/boxtribute/branch/master/graph/badge.svg?token=646MWM6V9H&flag=frontend)](https://codecov.io/gh/boxwise/boxtribute)

Backend Test Coverage: [![codecov](https://codecov.io/gh/boxwise/boxtribute/branch/master/graph/badge.svg?token=646MWM6V9H&flag=backend)](https://codecov.io/gh/boxwise/boxtribute)

Build: [![CircleCI](https://circleci.com/gh/boxwise/boxtribute.svg?style=svg)](https://circleci.com/gh/boxwise/boxtribute)

# Readme

This is the repo for the new mobile web app of [Boxtribute](www.boxtribute.org), consisting of a [React front-end](/react) bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and a [Python flask back-end](/flask).

Please check out [**Contribution Guidelines**](CONTRIBUTING.md) before you get started!

## Table of Contents

1. [Contribution Guidelines](CONTRIBUTING.md)
1. [Installation](#preparation-for-installation)
   1. [Basic steps](#preparation-for-installation)
   2. [Front-end](/react/README.md)
   3. [Back-end](/flask/README.md)
1. [About Docker](#about-docker)
1. [Development Database Seed](#development-database-seed)
1. [CircleCI](#circleci)
1. [Architecture overview](#architecture-overview)

## Preparation for Installation

- Install [Docker](https://www.docker.com/products/docker-desktop)
- Get in touch with the [Boxwise team](mailto:hello@boxwise.co) to get access to the [Auth0](https://auth0.com/) development tenant.

## How do I get set up?

These are the most basic steps to get front-end and back-end up and running. At the end of this section, there are links to further instructions to set-up additional tools for your front-end and back-end environment.

1.  Create a .env-file with the environment variables. Therefore, copy/paste `example.env` and rename it `.env`

2.  Enter the credentials from Auth0 into the `.env`-file. The following three variables need to be added. In the brackets there is a description of the location in the Auth0 dashboard. Let us know if you run into problems.

        AUTH0_CLIENT_ID (Applications --> <your application> --> Settings --> Basic Information --> Client ID)
        AUTH0_DOMAIN (Applications --> <your application> --> Settings --> Basic Information --> Domain)
        AUTH0_AUDIENCE (Applications --> APIs --> API Audience)

3.  To run the application, we assume you have Docker installed. You can then run:

    docker-compose up

### [Further Steps]

- [for front-end including react-testing-library, eslint, prettier](/react/README.md)
- [for back-end including pytest, venv, formatting and debugging](/flask/README.md)

## About Docker

We are using Docker containers to make it easy for everyone to spin up an development environment which is the same everywhere. In `docker-compose.yaml` three docker containers are specified - one for the mysql database called `mysql`, one for the flask back-end called `flask` and one for the react front-end called `react`.

## Development Database Seed

Boxtribute is an application for organisations who run distribution/warehouses in multiple bases.
Therefore the development database seed holds at least two organisations and three bases:

- Organisation `BoxAid` working on `Lesvos` and
- Organisation `BoxCare` working on `Samos` and in `Thessaloniki`.

Each organisation has at least 3 user groups with different access levels in the app:

- `Head of Operations` (Admin access)
- `Coordinator`
- `Volunteer`

For each of these three user groups of each of the two organisations we created an login credential for development purposes:

- `dev_headofops@boxaid.org`
- `dev_coordinator@boxaid.org`
- `dev_volunteer@boxaid.org`
- `dev_headofops@boxcare.org`
- `dev_coordinator@boxcare.org`
- `dev_volunteer@boxcare.org`

The password of all of these users is `password`.

Furthermore, here a collection of QR-Codes which have been seeded in the dev db and can be used to test the box scanning and box creation.

**Codes connected to existing Boxes in the seed**

![387b0f0f5e62cebcafd48383035a92a](docs/qr/existing/387b0f0f5e62cebcafd48383035a92a.png) ![cba56d486db6d39209dbbf9e45353c4](docs/qr/existing/cba56d486db6d39209dbbf9e45353c4.png) ![a61e0efe25b75032b91106372674c26](docs/qr/existing/a61e0efe25b75032b91106372674c26.png) ![f6f20e805192618def2cb400776a2aa](docs/qr/existing/f6f20e805192618def2cb400776a2aa.png) ![12ca607ce60c484bdbb703def950c5b](docs/qr/existing/12ca607ce60c484bdbb703def950c5b.png)
![13f12820c8010f2f7349962930e6bf4](docs/qr/existing/13f12820c8010f2f7349962930e6bf4.png) ![d0e144a0a4dc0d8af55e2b686a2e97e](docs/qr/existing/d0e144a0a4dc0d8af55e2b686a2e97e.png) ![69107b2e2b4157b5efe10415bc0bba0](docs/qr/existing/69107b2e2b4157b5efe10415bc0bba0.png) ![b8f0730d36571e4149ba3862379bb88](docs/qr/existing/b8f0730d36571e4149ba3862379bb88.png) ![e1fdfdd942db0e764c9bea06c03ba2b](docs/qr/existing/e1fdfdd942db0e764c9bea06c03ba2b.png)

**Codes not yet connected to Boxes in the seed**

![149ff66629377f6404b5c8d32936855](docs/qr/new/149ff66629377f6404b5c8d32936855.png) ![91c1def0b674d4e7cb92b61dbe00846](docs/qr/new/91c1def0b674d4e7cb92b61dbe00846.png) ![f660f96618eaa81e16b7869aca8d67d](docs/qr/new/f660f96618eaa81e16b7869aca8d67d.png) ![98b51c8cd1a02e54ab47edcc5733139](docs/qr/new/98b51c8cd1a02e54ab47edcc5733139.png) ![168842e6389b520d4b1836562aa1f05](docs/qr/new/168842e6389b520d4b1836562aa1f05.png) ![22324b7a180bdd31e125d5d50791d17](docs/qr/new/22324b7a180bdd31e125d5d50791d17.png)

## CircleCI

We are use CircleCI for automated testing of PRs and deployment to Google Cloud. To develop the CircleCI scripts you can run a CircleCI client locally. Please check out [the documentation](https://circleci.com/docs/2.0/local-cli/).

The most important commands are

```
circleci config validate
circleci local execute --job JOB_NAME
```

### CircleCI development tips/learnings

- You can only trigger a job locally if it is part of a CircleCI workflow.
- Each `run`-step in the config of CircleCI should be treated as its own terminal. If you have for example activated an virtual environment in a `run`-step, this environment is not activated in the next `run`-step.

## Architecture overview

All our architecture decisions are logged in ADRs which you can find [here](docs/adr/adr_template.md).
Here, is a list of intro tutorials for each technologies / frameworks / languages below.

#### Front-end

- [Typescript](https://react-typescript-cheatsheet.netlify.app/)
- [Custom Rebass Library](https://github.com/boxwise/react-components)
- [React](https://reactjs.org/docs/getting-started.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [React Context](https://reactjs.org/docs/context.html)
- [Apollo](https://www.apollographql.com/docs/react/)

#### Back-end

- [GraphQL](https://graphql.org/learn/)
- [Ariadne](https://ariadnegraphql.org/docs/flask-integration.html)
- [Python 3.X](https://devguide.python.org/)
- [Flask](https://flask.palletsprojects.com/en/1.1.x/tutorial/layout/)
- [PeeWee](http://docs.peewee-orm.com/en/latest/peewee/quickstart.html)
- MySQL

#### Authentication

- [Auth0](https://auth0.com/docs/quickstart/spa/react)

#### Testing

- [React Testing Library / Jest Tutorial](https://www.freecodecamp.org/news/8-simple-steps-to-start-testing-react-apps-using-react-testing-library-and-jest/)
- [Moving from Enzyme to React Testing Library](https://medium.com/@boyney123/my-experience-moving-from-enzyme-to-react-testing-library-5ac65d992ce)
- [Mocking Apollo Client](https://www.apollographql.com/docs/react/development-testing/testing/)
- [Pytest](https://docs.pytest.org/en/stable/fixture.html)

## License

See the LICENSE file for license rights and limitations (Apache 2.0).
