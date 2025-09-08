<a width="105" height="35" href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss" target="_blank" alt="Single Sign On & Token Based Authentication - Auth0">
<img width="105" height="35" alt="JWT Auth for open source projects" src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"></a>

Frontend Test Coverage: [![codecov](https://codecov.io/gh/boxwise/boxtribute/branch/master/graph/badge.svg?token=646MWM6V9H&flag=frontend)](https://codecov.io/gh/boxwise/boxtribute)

Backend Test Coverage: [![codecov](https://codecov.io/gh/boxwise/boxtribute/branch/master/graph/badge.svg?token=646MWM6V9H&flag=backend)](https://codecov.io/gh/boxwise/boxtribute)

Build: [![CircleCI](https://circleci.com/gh/boxwise/boxtribute.svg?style=svg)](https://circleci.com/gh/boxwise/boxtribute)

# boxtribute

This is the repository for version 2 of the humanitarian relief web app [Boxtribute](https://www.boxtribute.org). We support the distribution of over 1 million items each year and are deployed in over 15 locations across Europe and the Middle East (check our [website](https://boxtribute.org) for the most current list of partners).

Built by aid workers for aid workers, it is designed with three top priorities in mind:

1. Quick deployment into crisis situations, including easy integration into a large range of relief operations, whether they're being newly set up or already up and running.
2. Effective even with minimal training - doesn't require any professional expertise to use well. Can be run smoothly with short-term volunteers of all backgrounds.
3. Dignity and choice-based distribution as a first priority for vulnerable individuals.

The web app consists of a [React front-end](/front), and a [Python Flask back-end](/back).

Please check out [**Contribution Guidelines**](CONTRIBUTING.md) before you get started!

## Table of Contents

1. [Contribution Guidelines](CONTRIBUTING.md)
1. [Installation](#preparation-for-installation)
   1. [Basic steps](#preparation-for-installation)
   2. [Front-end](/react/README.md)
   3. [Back-end](/back/README.md)
1. [About Docker](#about-docker)
1. [Development Database Seed](#development-database-seed)
1. [CircleCI](#circleci)
1. [Architecture overview](#architecture-overview)
1. [Sponsors](#sponsors)

## Preparation for Installation

- Clone the repository.
- Install [Docker](https://www.docker.com/products/docker-desktop) and `docker-compose` (version 2)

## How do I get set up?

:star2: _Only TWO commands required to get the full-stack app up and running_ :star2:

At the end of this section, there are links to further instructions to set up additional tools for your front-end and back-end environment.

1.  Environment variables are managed in a single file. Run `cp example.env .env`

1.  To build and start the involved Docker services, execute

        docker compose up

1.  Open your web browser on `http://localhost:3000`

1.  Log in with one of the test users [listed below](#development-database-seed)

**NB: In case you get out-of-memory related errors, make sure your max memory is at least 4GB in your Docker settings (via _Docker Settings UI -> Resources -> Memory_) and try again.**
In (Linux) Docker there is no UI to set the memory limits globally. In that case, please specify the following in `docker-compose.yml`:

```
version: "2.4"
services:
    [...]
    front:
        mem_limit: 4G
```

### Further Steps

- [for front-end including react-testing-library, eslint, prettier](/front/README.md)
- [for back-end including pytest, venv, formatting and debugging](/back/README.md)

## About Docker

We use Docker containers to make it easy for everyone to spin up an development environment which is the same everywhere. In the [docker-compose configuration file](./docker-compose.yml) three Docker containers are specified - one for the MySQL database called `db`, one for the Flask back-end called `webapp` and one for the react front-end called `front`.

## Development Database Seed

Boxtribute is an application for organisations who run distribution/warehouses in multiple bases.
Therefore the development database seed holds at least two organisations and four bases:

- Organisation `BoxAid` working on `Lesvos` and
- Organisation `BoxCare` working on `Samos` and in `Thessaloniki` and `Athens`.

Each organisation has at least 3 user groups with different access levels in the app:

- `Head of Operations` (Admin access)
- `Coordinator`
- `Volunteer`

In the development seed and Auth0 dev tenant we created the following login credentials with names telling their role and access to the various bases:

- some.admin@boxtribute.org (God User)

BoxAid (all have access to only one base: Lesvos):

- dev_headofops@boxaid.org
- dev_coordinator@boxaid.org
- dev_volunteer@boxaid.org
- warehouse.volunteer@lesvos.org
- freeshop.volunteer@lesvos.org
- library.volunteer@lesvos.org

BoxCare (there are 3 bases associated - Thessaloniki, Samos, Athens):

- dev_headofops@boxcare.org
- dev_coordinator@boxcare.org (Coordinator at bases Thessaloniki and Samos)
- dev_volunteer@boxcare.org (Volunteer at bases Thessaloniki and Samos)
- coordinator@thessaloniki.org
- coordinator@samos.org
- coordinator@athens.org
- volunteer@thessaloniki.org
- volunteer@samos.org
- volunteer@athens.org
- warehouse.volunteer@athens.org
- freeshop.volunteer@athens.org
- label@athens.org (only for label creation)

The password of all of these users is `Browser_tests`.

A collection of various QR labels (associated/not associated with existing boxes) can be found in [this directory](./docs/qr).

### QR labels associated with boxes

Box in base 1

![box in base 1](./docs/qr/code-with-box-base-1-a3f22cbf5e52ea40557d8c8117ece5d3.png)

Box in base 2

![box in base 2](./docs/qr/code-with-box-base-2-c7c9691e8490695871eff25a7184a68d.png)

Box in base 3

![box in base 3](./docs/qr/code-with-box-base-3-04508398e21891508288f9d64c250f1e.png)

Box in base 4

![box in base 4](./docs/qr/code-with-box-base-4-d871e6c7f0a6e74fea024427a6ee3381.png)

### QR labels not associated with any boxes

![x0](./docs/qr/without-box/0159bdee5ace105482989775c591f1af.png)

![x1](./docs/qr/without-box/02aab8f4b84d9c917c9ed5ff148c7776.png)

![x2](./docs/qr/without-box/083c297c3de6396dad509f8018ac403d.png)

More boxes can be found [here](./docs/qr/without-box).

### QR labels that don't exist in the database

![x0](./docs/qr/not-in-database/168842e6389b520d4b1836562aa1f05.png)

![x1](./docs/qr/not-in-database/12ca607ce60c484bdbb703def950c5b.png)

![x2](./docs/qr/not-in-database/13f12820c8010f2f7349962930e6bf4.png)

More boxes can be found [here](./docs/qr/not-in-database).

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

### Deployment

About the versioning scheme:

- major version is always 2
- minor version is incremented if any database migration is part of the release
- "bugfix" version is incremented otherwise

1. Please commit (at least the last commit) using the command `git commit -S -m "..."` to make your commits verifiable. See [this ticket](https://trello.com/c/kgB1H7B0) for more info
1. Create a new list in trello named "Boxtribute 2.0 || merged to production date (v2.X.Y)"
1. Move the cards from the list "Boxtribute 2.0 || merged to staging" to the new list
1. Checkout the production branch and update it to the latest version: `git checkout production && git pull --tags origin production`
1. Merge master into production WITHOUT creating a merge commit (we want production to have the same history as master): `git pull origin master`
1. Publish the changes to the remote repo: `git push origin production`
1. Create a verifiable tag with the version number (check out the production branch after the merge, run `git tag -s v2.X.Y` and push the tag with `git push --tags`

## Architecture overview

All our architecture decisions are logged in ADRs which you can find [here](docs/adr/adr_template.md).

### System landscape

The follow diagram gives the system context for the boxtribute software acc. to the [C4 model](https://c4model.com/diagrams) architecture visualization method.

![C4 system landscape](docs/c4-system-landscape.png)

### Software stack

Here is a list of intro tutorials for each technologies / frameworks / languages.

#### Front-end

- [Typescript](https://react-typescript-cheatsheet.netlify.app/)
- [Chakra UI](https://chakra-ui.com/)
- [React](https://reactjs.org/docs/getting-started.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [React Context](https://reactjs.org/docs/context.html)
- [Apollo](https://www.apollographql.com/docs/react/)

#### Interface

- [GraphQL](https://graphql.org/learn/)

#### Back-end

- [Ariadne](https://ariadnegraphql.org/docs/flask-integration.html)
- [Python 3.12](https://devguide.python.org/)
- [Flask](https://flask.palletsprojects.com/en/1.1.x/tutorial/layout/)
- [PeeWee](http://docs.peewee-orm.com/en/latest/peewee/quickstart.html)
- [MySQL Community Edition](https://www.mysql.com/products/community/)

#### Authentication

- [Auth0](https://auth0.com/docs/quickstart/spa/react)

#### Testing

- [React Testing Library / Jest Tutorial](https://www.freecodecamp.org/news/8-simple-steps-to-start-testing-react-apps-using-react-testing-library-and-jest/)
- [Moving from Enzyme to React Testing Library](https://medium.com/@boyney123/my-experience-moving-from-enzyme-to-react-testing-library-5ac65d992ce)
- [Mocking Apollo Client](https://www.apollographql.com/docs/react/development-testing/testing/)
- [Pytest](https://docs.pytest.org/en/stable/fixture.html)

## License

See the [LICENSE file](./LICENSE.md) for license rights and limitations (Apache 2.0).

## Sponsors

This project was funded 3x by the German Federal Ministry of Education and Research (BMBF) via the [Prototype Fund](https://prototypefund.de/). Read more here (German only):

- [API für Datenbankzugriff und optimerten Austausch von Hilfsgütern](https://prototypefund.de/project/boxtribute-api-fuer-datenbankzugriff-und-optimierten-austausch-von-hilfsguetern/)
- [Erweiterung zur Unterstützung von Transient Refugees](https://prototypefund.de/project/erweiterung-von-boxtribute-zur-unterstuetzung-von-transient-refugees/)
- [Boxtribute 2.0](https://prototypefund.de/project/boxtribute-2-0/)

![BMBF logo](docs/bmbf.jpg)
