## Readme

## Table of Contents

1. [Contribution Guidelines](../CONTRIBUTING.md)
1. [Minimal development set-up](#development-set-up)
   1. [Install python](#install-python)
   2. [Set-up pre-commit](#set-up-pre-commit)
1. [Back-end development set-up](#be-development-set-up)
   1. [Linting and Formatting in VSCode](#linting-and-formatting-in-vscode)
   1. [Working with MySQL](#working-with-mysql)
   1. [Debugging](#debugging)
1. [Testing](#testing)
1. [GraphQL Playground](#graphql-playground)
1. [Authentication and Authorization on the back-end](#authentication-and-authorization)
1. [Database Migrations](#database-migrations)

## Minimal development set-up

The following steps build on top of each other and have to be performed in correct order. Installing Python incl. a virtual environment and pre-commit is mandatory for all developers.

### Install python

Install [Python >=3.6](https://www.python.org/downloads/) on your computer. You will need it to run tests on the back-end and the formatters and linters on both back-end and front-end.

### Create a Python virtual environment

A [Python virtual environments](https://docs.python.org/3/library/venv.html) helps to isolate the project's Python environment (i.e. installed packages) from the global one. Internally this works by injecting a project-specific path into Python's import path look-up. Execute the following command in the repo root to create a `.venv` folder that will hold project-specific dependencies

    python3 -m venv .venv

You should notice a `(.venv)` element in your shell prompt which means that the virtual environment is activated. **Please note** that you have to manually activate the virtual environment every time you launch a new shell by

    source .venv/bin/activate

On Windows run instead

    .\.venv\Scripts\activate

<details>
  <summary>You can automate the activation of the virtual environment. Click to read more.</summary>

  Virtual environments (venvs for short) must be activated and deactivated. If you are moving through folders in the terminal it can easily happen that you either miss activating or deactivating the venv resulting in errors and time wasted for development. With the [direnv](https://github.com/direnv/direnv) tool you can automate the activation and deactivation of venv depending on which folder you are in. There is already a `example.envrc` file in the root of this repo. If you install `direnv`, copy the `example.envrc` file into `.envrc` and allow to run it for your local repo, it will activate the Python virtual environment `venv` every time you enter the folder via a command line.

</details>

### Set-up pre-commit

[Pre-commit](https://pre-commit.com/) enables us to run code quality checks, such as missing semicolons, trailing whitespace, and debug statements, as well as consistent code formatting, before you commit your code. We chose pre-commit since it enables us to run these checks for both front-end and back-end in just one place.

1.  Install pre-commit and the linters/formatters (all declared in `/flask/requirements-dev.txt`). Run the command from the root folder of the repo

        pip install -U -e flask -r flask/requirements-dev.txt

2.  Install the git hooks

        pre-commit install --overwrite

Now you're all set up using Python code quality tools! `pre-commit` automatically checks the staged patch before committing. If it rejects a patch, add the corrections and try to commit again.

To figure out what else you can do with pre-commit, check out this [link](https://pre-commit.com/#usage).

## Back-end development set-up

The following are a couple of recommendations for IDE integration, database interaction, debugging, working with Docker, etc.

### Test environment set-up

**Crucial for running tests!**

Install the dependencies of the app in the activated virtual environment

    pip install -U -r flask/requirements.txt

For the integration tests authentication information is fetched from the [Auth0](https://auth0.com) website. Log in and select `Applications` -> `Applications` from the side bar menu. Select `boxtribute-dev-api`. Copy the `Client ID` and `Client Secret` into the `.env` file as the `AUTH0_CLIENT_TEST_ID` and `AUTH0_CLIENT_SECRET_TEST` variables, resp.

We're subject to a rate limit for tokens from Auth0. In order to avoid fetching tokens over and over again for every test run, do the following once before you start your development session:

1. Run the `./fetch_token` script
1. Paste the value of the `access_token` field as `AUTH0_TEST_JWT=` into the `.env` file

After 24h the token expires, so you have to repeat the procedure.

### Linting and Formatting in VSCode

Most of our developers are using VSCode. Instead of running our linter (flake8) and our formatter (black) for Python just when you are committing your code, we added a few settings in `.vscode/settings.json` so that your files are formatted and linted when you save a Python file.

### Working with MySQL

Since we are working with docker you do not have to install a local MySQL server on your computer. Instead, you can just connect to the MySQL server in one of the Docker containers.

The development database is called `dropapp_dev` and the password is `dropapp_root`.

#### General notes on Docker network

In the docker-compose file we define a separate docker network called `backend` to which the back-end containers are joined. Each container can now look up the host name `flask` or `mysql` and get back the appropriate container’s IP address.
To access the mysql database, there are now three possibilities:

1. You reach the mysql db at `MYSQL_HOST=mysql` and `MYSQL_PORT=3306` or
1. You execute the mysql command line client in the running container by `docker-compose exec mysql mysql -u root -p` or
1. by specifying the IP-address of the gateway for `MYSQL_HOST` and `MYSQL_PORT=32000`.

To figure out the gateway of the docker network `backend` run

        docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' boxtribute_backend

#### MySQL workbench or other editors

Most of our developers use [MySQL workbench](https://dev.mysql.com/doc/workbench/en/wb-installing.html) to interact with the database directly. If you want to connect to the database, choose one of the possibilities in the former to define the connection, e.g. Hostname is 172.18.0.1 and Port is 3306.

#### ORM

From the Python side of the application we use an Object Relational Mapper (ORM) to interact with the database. An ORM provides a convenient abstraction interface since it leverages Python's language features and is more secure compared to using raw SQL queries.
It was [decided](../docs/adr/Python-ORM.md) to settle with [peewee](https://docs.peewee-orm.com/en/latest/index.html) as ORM solution. It builds on models (see `flask/boxwise_flask/models/` as abstraction of the MySQL database tables.

#### Auto-generating peewee model definitions

The `pwiz` utility helps to generate peewee model definitions by inspecting a running database. It is already installed with the `peewee` package.

1. Start the database by `docker-compose up mysql`
1. Obtain the gateway IP of the Docker network `boxtribute_backend` as described above.
1. Run `python -m pwiz -H XXX.XX.X.X -p 32000 -u root -e mysql -t camps -P dropapp_dev > base.py` to generate the model definitions of the `camps` table, and write them into the file `base.py`.

### Debugging

By default the flask app runs in `development` mode in the Docker container which means that hot-reloading and debugging is enabled.

#### Built-in flask debugger

For debugging an exception in an endpoint, direct your web browser to that endpoint. The built-in flask debugger is shown. You can attach a console by clicking the icons on the right of the traceback lines. For more information, refer to the [documentation](https://flask.palletsprojects.com/en/1.1.x/quickstart/#debug-mode).

#### Debugging Back-end in VSCode

VSCode has [a very easy-to-use debugger](https://code.visualstudio.com/docs/editor/debugging) built-in.

To use the debugger:

1. install the extensions to [access Docker container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and to [debug python](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
2. Start the docker containers.
3. [Attach to the running Docker container for the `flask` service.](https://code.visualstudio.com/docs/remote/containers#_attaching-to-running-containers)
4. A new VSCode window pops up which is run from within the docker container `boxtribute_flask` Docker container.
5. Open the `/codedir` in the new VSCode which popped up. The `codedir` folder is the equivalent of the repo folder in the Docker container.

The following step are only required the first time or after you deleted a Docker container: 6. Install the [python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) inside the Docker container.

Final steps: 7. [Launch the debug configuration called 'Python: Run Flask in docker container to debug'.](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

You can now set break-points in your code.
If you want to debug a certain endpoint, set a break-point in the endpoint and call this endpoint at the port 5001, e.g.
`localhost:5001/api/public`
If you want to break on any other code lines (not endpoints), then you can only catch them during the server start-up.

#### Usage of Logger

To log to the console from inside the docker container, create an instance of app using:

    from flask import Flask
    app = Flask(__name__)

and log with:

    app.logger.warn(<whatever you want to log>)

## Testing

Our tests verify the production code on different levels:

1. **Unit tests**: testing isolated functionality, e.g. `auth_tests/`
1. **Data model tests**: testing data models, requiring a test database being set up. See `model_tests/`
1. **App tests**: testing behavior of Flask app, mostly the handling of GraphQL requests. Requires a test database being set up, or a MySQL database server running in the background. Any data for user authentication and authorization is mocked. See `endpoint_tests/`
1. **Integration tests**: testing integration of Auth0 web service for user auth(z). Requires a working internet connection. Parameters for the test user are read from the `.env` file. See `integration_tests/`

### Executing tests

Run the test suite on your machine by executing

    pytest

Some tests require a running MySQL server and are disabled unless during a CircleCI pipeline. Local testing is possible by

    docker-compose up -d mysql  # only the first time
    CIRCLECI=1 MYSQL_PORT=32000 pytest

If you persistently want these variables to be set for your environment, export them via the `.envrc` file.

### Writing tests

We use the pytest framework to build tests. Please refer to their excellent [documentation](https://docs.pytest.org/en/stable/contents.html).

New test files must begin with the word `test_` such that they are discovered when running pytest, for example: `test_module.py`

and similarly the test functions must have the format

    def test_functionality():

In the pytest framework, **fixtures** serve as common base setups for individual test functions. To use a fixture, pass it as argument into the test function.
Fixtures are configured in the `conftest.py` files which are automatically loaded before test execution.

#### Data model tests

For test execution, it is required to create test data, and then verify the results of database operations against it.

For each data model, one separate test module exists (e.g. `test_box.py` for the `Box` data model).

Test data is set up in the `test/data/` folder. Three definitions are required:

1. The default data function is a dictionary which has all of the data for that database table

        def default_<model>_data():

2. The fixture passes this data into the required tests

        @pytest.fixture()
        def default_<model>():

3. The creation function is called on the setup of a test so that all of the data is in the database when the test is ran

        def create_default_<model>():
            <data_model>.create(**default_<model>_data())

**Please be aware that**

- for new data the fixtures must be imported in `test/data/__init__.py` and added to the `__all__` list
- the creation function needs must be added to `test/data/setup_tables.py`
- the new model must be added to the list in `boxwise_flask/models/__init__.py`

#### App tests

The test functions usually take an app client fixture along with the required data fixtures.

    def test_<test_name>(client, <data_fixture_name>):

to allow for making requests to the app, and verify the response with previously set-up data.

### Coverage analysis

From the repository root, run

    pytest --cov=flask/boxwise_flask --cov-report=term --cov-report=html flask

and inspect the reported output. Open the HTML report via `flask/htmlcov/index.html` to browse coverage for individual source code files.

## GraphQL Playground

The back-end exposes the GraphQL API at the `/graphql` endpoint. You can experiment with the API in the GraphQL playground.

1. Start the required services by `docker-compose up flask mysql`
1. Open `localhost:5000/graphql`.
1. Simulate being a valid, logged-in user by fetching an authorization token (internally the variables of the `.env` file are used)
    ./fetch_token
1. Copy the content of the `access_token` field (alternatively, you can pipe the above command ` | jq -r .access_token | xclip -i -selection c` to copy it to the system clipboard)
1.  Insert the access token in the following format on the playground in the section on the bottom left of the playground called HTTP Headers.

        { "authorization": "Bearer <the token you retrieved from Auth0>"}

1. A sample query you can try if it works is:

    query {
        bases {
            name
        }
    }

## Production environment

In production, the web app is run by the WSGI server `gunicorn` which serves as a glue between the web app and the web server (e.g. Apache). `gunicorn` allows for more flexible configuration of request handling (see `flask/gunicorn.conf.py` file).

Launch the production server by

    FLASK_ENV=production docker-compose up --build flask

## Authentication and Authorization

We use the [Auth0](https://auth0.com) web service to provide the app client with user authentication and authorization data (for short, auth and authz, resp.).

The user has to authenticate using their password, and is then issued a JSON Web Token (JWT) carrying authz information (e.g. permissions to access certain resources). Every request that the client sends to a private endpoint must hold the JWT as `bearer` in the authorization header. When handling the request, the server decodes the JWT, extracts the authz information, and keeps it available for the duration of the request (the implementation is in `boxwise_flask.auth.require_auth`).

## Database Schema Migrations

Occasionally it might be required to update the database schema. To this end we use the [peewee-moves](https://github.com/timster/peewee-moves) tool.
`peewee-moves` runs migrations defined in Python scripts, and stores a migration history in the database. Migration management is performed by the `flask db` command. In the development environment you can
1. run `docker-compose up` to start all services
1. run `docker-compose exec flask sh` to open a shell in the `flask` container. Run `flask db --help` from there
1. You can create an empty migration script via `flask db revision <migration-name>`. The file name receives an auto-incremented index. The creation date-time is stored in the top script docstring.
1. Implement `upgrade()` and `downgrade()` functions in the script for defining the rollforward/rollback behavior.
1. Apply all pending migrations by `flask db upgrade`, and rollback the latest migration by `flask db downgrade`.
1. Query the current migration status of the database via `flask db status`.

Migration scripts must be stored in `flask/boxwise_flask/migrations`, and are put under version-control.

For an example migration, see `docs/peewee-moves/`.
