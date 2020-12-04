[![CircleCI](https://circleci.com/gh/boxwise/boxtribute.svg?style=svg)](https://circleci.com/gh/boxwise/boxtribute)
<a width="105" height="35" href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss" target="_blank" alt="Single Sign On & Token Based Authentication - Auth0">
<img width="105" height="35" alt="JWT Auth for open source projects" src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"></a>

# Readme
This is the repo for the new mobile web app of [Boxtribute](www.boxtribute.org), consisting of a [React front-end](/react) bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and a [Python flask back-end](/flask).

Please check out [**Contribution Guidelines**](CONTRIBUTING.md) before you get started!

## Preparation for Installation

* Install [Docker](https://www.docker.com/products/docker-desktop)
* Get in touch with the [Boxwise team](mailto:hello@boxwise.co) to get access to the [Auth0](https://auth0.com/) development tenant.

## How do I get set up?

1. Create a .env-file with the environment variables. Therefore, copy/paste `example.env` and rename it `.env`

2. Enter the credentials from Auth0 into the `.env`-file. The following three variables need to be added. In the brackets there is a description of the location in the Auth0 dashboard. Let us know if you run into problems.

        AUTH0_CLIENT_ID (Applications --> <your application> --> Settings --> Basic Information --> Client ID)
        AUTH0_DOMAIN (Applications --> <your application> --> Settings --> Basic Information --> Domain)
        AUTH0_AUDIENCE (Applications --> APIs --> API Audience)

3. To run the application, we assume you have Docker installed. You can then run:

       docker-compose up

## Docker

We are using Docker containers to make it easy for everyone to spin up an development environment which is the same everywhere. In `docker-compose.yaml` three docker containers are specified - one for the mysql database called `mysql`, one for the flask backend called `web` and one for the react front-end called `react`.

### Note about NPM/Yarn

When you wish to add a dependency, when you make the change to your local package.config, you will need to rebuild the docker container and relaunch.

You can add packages during development without rebuilding by installing it inside the container. Your changes will last until you "docker-compose down" and will be saved on host for next build.

For example, to add XYZ to the `package.json` file in the `react` folder while developing, you can run this:

      docker-compose exec react yarn add XYZ

(This advice has come from https://github.com/BretFisher/node-docker-good-defaults)

### Docker networking

In the docker-compose file we define a separate docker network called `backend` to which the backend containers are joined. Each container can now look up the hostname `web` or `mysql` and get back the appropriate container’s IP address.
To access the mysql database from the `web` container there are now two ways:
1. For example, you reach the mysql db at `MYSQL_HOST=mysql` and `MYSQL_PORT=3306` or
2. by specifying the IP-address of the Gateway for `MYSQL_HOST` and `MYSQL_PORT=32000`.

To figure out the gateway of the docker network `backend` run

        docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' boxtribute_backend

You can choose one of the two and specify the credentials in the `.env`-file.

## Development Database Seed

Boxtribute is an application for organisations who run distribution/warehouses in multiple bases.
Therefore the development database seed holds at least two organisations and three bases:
* Organisation `BoxAid` working on `Lesvos` and
* Organisation `BoxCare` working on `Samos` and in `Thessaloniki`.

Each organisation has at least 3 user groups with different access levels in the app:
* `Head of Operations` (Admin access)
* `Coordinator`
* `Volunteer`

For each of these three user groups of each of the two organisations we created an login credential for development purposes:
* `dev_headofops@boxaid.org`
* `dev_coordinator@boxaid.org`
* `dev_volunteer@boxaid.org`
* `dev_headofops@boxcare.org`
* `dev_coordinator@boxcare.org`
* `dev_volunteer@boxcare.org`

The password of all of these users is `password`.

Furthermore, here a collection of QR-Codes which have been seeded in the dev db and can be used to test box creation.

![387b0f0f5e62cebcafd48383035a92a](docs/qr/387b0f0f5e62cebcafd48383035a92a.png) ![cba56d486db6d39209dbbf9e45353c4](docs/qr/cba56d486db6d39209dbbf9e45353c4.png) ![a61e0efe25b75032b91106372674c26](docs/qr/a61e0efe25b75032b91106372674c26.png) ![f6f20e805192618def2cb400776a2aa](docs/qr/f6f20e805192618def2cb400776a2aa.png) ![12ca607ce60c484bdbb703def950c5b](docs/qr/12ca607ce60c484bdbb703def950c5b.png)
![13f12820c8010f2f7349962930e6bf4](docs/qr/13f12820c8010f2f7349962930e6bf4.png) ![d0e144a0a4dc0d8af55e2b686a2e97e](docs/qr/d0e144a0a4dc0d8af55e2b686a2e97e.png) ![69107b2e2b4157b5efe10415bc0bba0](docs/qr/69107b2e2b4157b5efe10415bc0bba0.png) ![b8f0730d36571e4149ba3862379bb88](docs/qr/b8f0730d36571e4149ba3862379bb88.png) ![e1fdfdd942db0e764c9bea06c03ba2b](docs/qr/e1fdfdd942db0e764c9bea06c03ba2b.png)

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

## GraphQL
We are setting up GraphQL as a data layer for this application. To check out the playground, run this project with the above docker-compose instructions, and go to localhost:5000/graphql.
In order to not expose personal data over an unsecured API, we require you to authenticate in order to access the graphQL endpoint. The easiest way to do this currently is:
-  start up the frontend (go into the boxwise-react directory and run `yarn && yarn start`), log in with the demo user (user@user.co, ask Hans for the password), and the access token will be printed in the console when you inspect the page (or you can pull it out of the cookies, whatever you want).
- paste this long string (it will start with "ey" and then a bunch more stuff) into the bottom left section of the playground labled `HTTP Headers` as the Authorization header.
    - it will be in the form: `{"Authorization": "Bearer ey.....}`
- every so often the validity of your access token will time out, so you will need to re-authenticate via the frontend and then paste a new token into the playground.

A sample query you can try is:
```
query {
  allBases {
    name
  }
}
```
## Testing Guidelines
When writing tests, try to follow these guidelines if possible:

+ Tests should be as readable as possible and not complex at all. You should understand them by looking at them just once.
+ Local helper functions defined in test files should have functional and easy-to-understand rather than technical names. Meaning, `clickNewUserButton()` is better than `clickElementByTypeAndTestId('button','new-user-button')`.
+ More general use helpers like 'clickElementByTypeAndTestId' can be used within the local helper functions if preferred. The reason for functional naming preference lies in increased readability of tests.
+ Avoid any duplication of helper functions across several files! If using the same functions in several tests (files), there's a tendency to copy-paste the whole file and then rewrite tests. This leads to code duplication of helper functions. Instead, helper functions needed in several locations should be defined in one place should be available globally. Find the matching one by name or create a new one. Avoid creating miscellaneuos file names as it tends to lead to chaos.
+ Current codebase doesn't 100% follow everything stated above but it'd definitely help organising the test helpers accordingly from now on.

![Selection_599](https://user-images.githubusercontent.com/8964422/77221481-6a190d00-6b4a-11ea-88d7-9fc70ce1c982.png)

Up until now, we have mainly written unit tests and integration tests on frontend and backend. Unit tests are testing single units of code in only one environment or framework, integration tests test the integration between different frameworks / technologies.
Please find here collection of [best practices for unit tests](https://medium.com/better-programming/13-tips-for-writing-useful-unit-tests-ca20706b5368).

## Architecture overview

All our architecture decisions are logged in ADRs which you can find [here](docs/adr/adr_template.md).
Here, is a list of intro tutorials for each technologies / frameworks / languages below.

#### Frontend

- [Typescript](https://react-typescript-cheatsheet.netlify.app/)
- [Custom Rebass Library](https://github.com/boxwise/react-components)
- [React](https://reactjs.org/docs/getting-started.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [React Context](https://reactjs.org/docs/context.html)
- [Apollo](https://www.apollographql.com/docs/react/)

#### Backend

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
