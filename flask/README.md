[![CircleCI](https://circleci.com/gh/boxwise/boxtribute.svg?style=svg)](https://circleci.com/gh/boxwise/boxtribute)
<a width="105" height="35" href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss" target="_blank" alt="Single Sign On & Token Based Authentication - Auth0">
       <img width="105" height="35" alt="JWT Auth for open source projects" src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"></a>

# Readme
This is a simple flask app to be used together with the [react-client](https://github.com/boxwise/boxwise-react) for the revamp of [Boxtribute](www.boxtribute.org)

## Preparation for Installation

* Install [Docker](https://www.docker.com/products/docker-desktop)
* Get an invite to the development tenant of [Auth0](https://auth0.com/) for Boxtribute.

## How do I get set up?

1. Create an `.env`-file  from the file `example.env` and add values for [`AUTH0_DOMAIN` and `AUTH0_AUDIENCE`](https://auth0.com/docs/dashboard/reference/settings-application). Please use the same ones as for the corresponding [react-client](https://github.com/boxwise/boxwise-react).

2. To run the application, we assume you have Docker installed. You can then run:

       docker-compose up

## Database

-----

:warning: The initial database seed is a copy of mysql-database of the [old dropapp project](https://github.com/boxwise/boxwise-dropapp). Since this is a simple mysqldump, it may not be up to date.

-----

## Development Database Seed

Boxwise is an application for organisations who run distribution/warehouses in multiple bases.
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

### Command-line access

If you want to connect to the MySQL server from your host machine, you can do this using

    docker exec -it <name of the db-docker container, e.g. boxtribute_mysql_1> mysql -u root -p

The mysql server in your docker container is also reachable on port `32000` of your localhost

    mysql --host=127.0.0.1 --port=32000 -u root -p

The password for the root-user for the db `dropapp_dev` is `dropapp_root`.

### MySQL workbench access

Most of us use workbench to access the MySQL database. To establish a connection you need to enter your `localhost`-address, e.g. `127.0.0.1`, for 'Hostname' and `32000` for 'Port'.

### Re-seed your database

At the moment it is easiest if remove your db-docker container with

    docker rm <name of the db-docker container, e.g. boxtribute_mysql_1>

and restart it afterwards.This is only a short-term solution for now.

## Development

This project is developed in Python >= 3.6. For setting up the development environment for the first time, create a [Python virtual environment](https://docs.python.org/3.6/library/venv.html), e.g. by

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -e . -r requirements-dev.txt
    pre-commit install --overwrite

Now you're all set up using Python code quality tools! `pre-commit` automatically checks the staged patch before committing. If it rejects a patch, add the corrections and try to commit again.

Whenever you start a new shell to run tests, style-checks, or work on some code in general, activate the Python virtual environment

    source .venv/bin/activate

Have a look at [direnv](https://github.com/direnv/direnv) if you're interested in ways to automate this procedure.

### Testing

Run the test suite on your machine by executing

    pytest

Two types of tests can be setup. Model tests and endpoint tests.

New test files should begin with the word test so the they are discovered when running pytest.
for example:
```
test_<test_file_name>.py
```
and similarly the test functions should have the format
```
def test_<test_name>():
```
For endpoint testing, the test functions usually take two fixtures.
```
def test_<test_name>(client, database):
```
to allow for databases to be preconfigured with data and requests to be made to the app.

Fixtures are configured in the `conftest.py` files which execute automatically before a test.

### Formatting and linting

Run a full style-check by

    pre-commit run --all-files

### Debugging

By default the flask app runs in `development` mode which has hot-reloading and debugging enabled.

#### Built-in flask debugger

For debugging an exception in an endpoint, direct your webbrowser to that endpoint. The built-in flask debugger is shown. You can attach a console by clicking the icons on the right of the traceback lines. For more information, refer to the [documentation](https://flask.palletsprojects.com/en/1.1.x/quickstart/#debug-mode).

#### Debugging in VSCode

Many of our developers are using VSCode which has [a very easy-to-use debugger](https://code.visualstudio.com/docs/editor/debugging) built-in.
A launch configuration for the debugger is added to the repo.

To use the debugger:
1. install the extensions to [access Docker container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and to [debug python](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
2. Start the docker containers.
3. [Attach to the running Docker container for the `web` service.](https://code.visualstudio.com/docs/remote/containers#_attaching-to-running-containers) By this step a new VSCode window will open to work from inside the `boxtribute_web` Docker container.
4. A new VSCode window pops up which is run from within the docker container `boxtribute_web` Docker container.
5. Open the `/codedir` in the new VSCode which popped up. The `codedir` folder is the equivalent of the repo folder in the Docker container.

The following step are only required the first time or after you deleted a Docker container:
6. Install the [python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) inside the Docker container.

Final steps:
7. [Launch the debug configuration called 'Python: Run Flask in docker container to debug'.](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

You can now set break-points in your code.
If you want to debug a certain endpoint, set a break-point in the endpoint and call this enpoint at the port 5001, e.g.
        `localhost:5001/api/public`
If you want to break on any other code lines (not endpoints), then you can only catch them during the server start-up.

#### Usage of Logger
To log to the console from inside the docker container, import app from app.py, and log with:
        `app.logger.warn(<whatever you want to log>)`

### GraphQL
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

#### CircleCI
We are use CircleCI for automated testing of PRs and deployment to Google Cloud. To develop the CircleCI scripts you can run a CircleCI client locally. Please check out [the documentation](https://circleci.com/docs/2.0/local-cli/).

The most important commands are
```
circleci config validate
circleci local execute --job JOB_NAME
```

##### CircleCI development tips/learnings
- You can only trigger a job locally if it is part of a CircleCI workflow.
- Each `run`-step in the config of CircleCI should be treated as its own terminal. If you have for example activated an virtual environment in a `run`-step, this environment is not activated in the next `run`-step.

## Docker

We are using Docker containers to make it easy for everyone to spin up an development environment which is the same everywhere. In `docker-compose.yaml` two docker containers are specified - one for the mysql database called `mysql` and one for the flask backend called `web`.

### Docker networking

In the docker-compose file we define a separate docker network called `backend` to which both containers are joined. Each container can now look up the hostname `web` or `mysql` and get back the appropriate container’s IP address.
To access the mysql database from the `web` container there are now two ways:
1. For example, you reach the mysql db at `MYSQL_HOST=mysql` and `MYSQL_PORT=3306` or
2. by specifying the IP-address of the Gateway for `MYSQL_HOST` and `MYSQL_PORT=32000`.

To figure out the gateway of the docker network `backend` run

        docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' boxtribute_backend

You can choose one of the two and specify the credentials in the `.env`-file.

## License
See the LICENSE file for license rights and limitations (Apache 2.0).
