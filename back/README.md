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
1. [GraphQL API](#graphql-api)
1. [Production environment](#production-environment)
1. [Performance evaluation](#performance-evaluation)
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

1.  Install pre-commit and the linters/formatters (all declared in `/back/requirements-dev.txt`). Run the command from the root folder of the repo

        pip install -U -e back -r back/requirements-dev.txt

2.  Install the git hooks

        pre-commit install --overwrite

Now you're all set up using Python code quality tools! `pre-commit` automatically checks the staged patch before committing. If it rejects a patch, add the corrections and try to commit again.

To figure out what else you can do with pre-commit, check out this [link](https://pre-commit.com/#usage).

## Back-end development set-up

The following are a couple of recommendations for IDE integration, database interaction, debugging, working with Docker, etc.

### Test environment set-up

**Crucial for running tests!**

Install the dependencies of the app in the activated virtual environment

    pip install -U -e back -r back/requirements-dev.txt

For the integration tests authentication information is fetched from the [Auth0](https://auth0.com) website. Log in and select `Applications` -> `Applications` from the side bar menu. Select `boxtribute-dev-api`. Copy the `Client Secret` into the `.env` file as the `AUTH0_CLIENT_SECRET_TEST` variables.

We're subject to a rate limit for tokens from Auth0. In order to avoid fetching tokens over and over again for every test run, do the following once before you start your development session:

1. Run the `./fetch_token` script
1. Paste the value of the `access_token` field as `AUTH0_TEST_JWT=` into the `.env` file

After 24h the token expires, so you have to repeat the procedure.

### Linting and Formatting in VSCode

Most of our developers are using VSCode. Instead of running our linter (flake8) and our formatter (black) for Python just when you are committing your code, we added a few settings in `.vscode/settings.json` so that your files are formatted and linted when you save a Python file.

### Working with MySQL

Since we are working with Docker you do not have to install a local MySQL server on your computer. Instead, you can just connect to the MySQL server in one of the Docker containers.

The development database is called `dropapp_dev` and the password is `dropapp_root`.

#### General notes on Docker network

In the docker-compose file we define a separate Docker network called `backend` to which the back-end containers are joined. Each container can now look up the host name `webapp` or `db` and get back the appropriate container’s IP address.
To access the MySQL database, there are now three possibilities:

1. You reach the MySQL db at `MYSQL_HOST=db` and `MYSQL_PORT=3306` or
1. You execute the MySQL command line client in the running container by `docker-compose exec db mysql -u root -p` or
1. by specifying the IP-address of the gateway for `MYSQL_HOST` and `MYSQL_PORT=32000`.

To figure out the gateway of the Docker network `backend` run

    docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' boxtribute_backend

#### MySQL workbench or other editors

Most of our developers use [MySQL workbench](https://dev.mysql.com/doc/workbench/en/wb-installing.html) to interact with the database directly. If you want to connect to the database, choose one of the possibilities in the former to define the connection, e.g. Hostname is 172.18.0.1 and Port is 3306.

#### Database dump

The `db` docker-compose service runs on a dump (`back/init.sql`) generated from the database of dropapp's staging environment. If it has been updated, run the following for the changes to take effect

    docker-compose rm db
    docker-compose up -d --build db

#### ORM

From the Python side of the application we use an Object Relational Mapper (ORM) to interact with the database. An ORM provides a convenient abstraction interface since it leverages Python's language features and is more secure compared to using raw SQL queries.
It was [decided](../docs/adr/Python-ORM.md) to settle with [peewee](https://docs.peewee-orm.com/en/latest/index.html) as ORM solution. It builds on models (see `back/boxtribute_server/models/` as abstraction of the MySQL database tables.

#### Auto-generating peewee model definitions

The `pwiz` utility helps to generate peewee model definitions by inspecting a running database. It is already installed with the `peewee` package.

1. Start the database by `docker-compose up db`
1. Obtain the gateway IP of the Docker network `boxtribute_backend` as described above.
1. Run `python -m pwiz -H XXX.XX.X.X -p 32000 -u root -e mysql -t camps -P dropapp_dev > base.py` to generate the model definitions of the `camps` table, and write them into the file `base.py`.

### Debugging

By default the Flask app runs in `development` mode in the Docker container which means that hot-reloading and debugging is enabled.

#### Built-in Flask debugger

For debugging an exception in an endpoint, direct your web browser to that endpoint. The built-in Flask debugger is shown. You can attach a console by clicking the icons on the right of the traceback lines. For more information, refer to the [documentation](https://flask.palletsprojects.com/en/1.1.x/quickstart/#debug-mode).

#### Debugging Back-end in VSCode

VSCode has [a very easy-to-use debugger](https://code.visualstudio.com/docs/editor/debugging) built-in.

<details>
  <summary>For info on how to use the debugger click here.</summary>

1. install the extensions to [access Docker container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and to [debug python](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
2. Start the Docker containers.
3. [Attach to the running Docker container for the `webapp` service.](https://code.visualstudio.com/docs/remote/containers#_attaching-to-running-containers)
4. A new VSCode window pops up which is run from within the `boxtribute_webapp` Docker container.
5. Open the `/codedir` in the new VSCode which popped up. The `codedir` folder is the equivalent of the repo folder in the Docker container.

The following step are only required the first time or after you deleted a Docker container: 6. Install the [python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) inside the Docker container.

Final steps: 7. [Launch the debug configuration called 'Python: Run Flask in Docker container to debug'.](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

You can now set break-points in your code.
If you want to debug a certain endpoint, set a break-point in the endpoint and call this endpoint at the port 5001, e.g.
`localhost:5001/api/public`
If you want to break on any other code lines (not endpoints), then you can only catch them during the server start-up.
</details>

#### Usage of Logger

To log to the console while running the `webapp` service, do

    from flask import current_app
    current_app.logger.warn(<whatever you want to log>)

Note that in production mode, logging is also subject to the configuration of the WSGI server.

## Testing

Our tests verify the production code on different levels:

1. **Unit tests**: testing isolated functionality, e.g. `auth_tests/`
1. **Data model tests**: testing data models, requiring a test database being set up. See `model_tests/`
1. **App tests**: testing behavior of Flask app, mostly the handling of GraphQL requests. Requires a test database being set up, or a MySQL database server running in the background. Any data for user authentication and authorization is mocked. See `endpoint_tests/`
1. **Integration tests**: testing integration of Auth0 web service for user auth(z). Requires a working internet connection. Parameters for the test user are read from the `.env` file. See `integration_tests/`

### Executing tests

Most tests require a running MySQL server. Before executing tests for the first time, do

    docker-compose up -d db

Run the test suite on your machine by executing

    MYSQL_PORT=32000 pytest

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

For each data model, retrieve the default data, and verify the result in `model_tests/test_all.py`.

Test data is set up in the `test/data/` folder. Three definitions are required:

1. The default data function returns a dictionary which holds a row of data for that database table (or an iterable containing data for multiple rows)

        def data():

2. The fixture passes this data into the required tests

        @pytest.fixture
        def default_<model>():
            return data()

3. The creation function is called on the setup of a test so that all of the data is in the database when the test is ran

        def create():
            <data_model>.create(**data())

**Please be aware that**

- for new data the fixtures must be imported in `test/data/__init__.py` and added to the `__all__` list

#### App tests

The test functions usually take an app client fixture along with the required data fixtures.

    def test_<test_name>(client, <data_fixture_name>):

to allow for making requests to the app, and verify the response with previously set-up data.

### Coverage analysis

From the repository root, run

    pytest --cov --cov-report=term --cov-report=html back

and inspect the reported output. Open the HTML report via `back/htmlcov/index.html` to browse coverage for individual source code files.

## GraphQL API

The back-end exposes the GraphQL API at the `/graphql` endpoint.
It is consumed by our front-end, and by partners (for data retrieval).

### Schema documentation

For building a static web documentation of the schema, see [this directory](../docs/graphql-api).

### Playground

You can experiment with the API in the GraphQL playground.

1. Set `export FLASK_ENV=development`
1. Start the required services by `docker-compose up webapp db`
1. Open `localhost:5005/graphql`.
1. Simulate being a valid, logged-in user by fetching an authorization token (internally the variables of the `.env` file are used): `./fetch_token`
1. Copy the content of the `access_token` field (alternatively, you can pipe the above command ` | jq -r .access_token | xclip -i -selection c` to copy it to the system clipboard)
1.  Insert the access token in the following format on the playground in the section on the bottom left of the playground called HTTP Headers.

        { "authorization": "Bearer <the token you retrieved from Auth0>"}

1. A sample query you can try if it works is:

        query {
            organisations {
                name
            }
        }

## Production environment

In production, the web app is run by the WSGI server `gunicorn` which serves as a glue between the web app and the web server (e.g. Apache). `gunicorn` allows for more flexible configuration of request handling (see `back/gunicorn.conf.py` file).

Launch the production server by

    FLASK_ENV=production docker-compose up --build webapp

In production mode, inspection of the GraphQL server is disabled, i.e. it's not possible to run the GraphQL playground.

## Performance evaluation

### Load testing

Used in combination with [k6](https://k6.io/docs/). See the example [script](./scripts/load-test.js) for instructions.

### Profiling

1. Add profiling middleware by extending `main.py`

        import pathlib
        from werkzeug.middleware.profiler import ProfilerMiddleware
        # ...
        # setting up app
        # ...
        BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
        app = ProfilerMiddleware(app, profile_dir=str(BASE_DIR / "stats"))

1. Create output directory for profile files

        mkdir -p back/stats

1. Launch the production server as mentioned above, and the database service
1. Run a request, e.g. `dotenv run k6 run back/scripts/load-test.js`
1. `pip install` a profile visualization tool, e.g. [tuna](https://github.com/nschloe/tuna) or [snakeviz](https://github.com/jiffyclub/snakeviz) and load the profile

        tuna back/stats/some.profile
        snakeviz back/stats/some.profile

1. Inspect the stack visualization in your web browser.

## Authentication and Authorization

We use the [Auth0](https://auth0.com) web service to provide the app client with user authentication and authorization data (for short, auth and authz, resp.).

The user has to authenticate using their password, and is then issued a JSON Web Token (JWT) carrying authz information (e.g. permissions to access certain resources). Every request that the client sends to a private endpoint must hold the JWT as `bearer` in the authorization header. When handling the request, the server decodes the JWT, extracts the authz information, and keeps it available for the duration of the request (the implementation is in `boxtribute_server.auth.require_auth`).

## Database Schema Migrations

Occasionally it might be required to update the database schema. To this end we use the [peewee-moves](https://github.com/timster/peewee-moves) tool.
`peewee-moves` runs migrations defined in Python scripts, and stores a migration history in the database. Migration management is performed by the `flask db` command. In the development environment you can
1. run `docker-compose up` to start all services
1. run `docker-compose exec webapp sh` to open a shell in the `webapp` container. Run `flask db --help` from there
1. You can create an empty migration script via `flask db revision <migration-name>`. The file name receives an auto-incremented index. The creation date-time is stored in the top script docstring.
1. Implement `upgrade()` and `downgrade()` functions in the script for defining the rollforward/rollback behavior.
1. Apply all pending migrations by `flask db upgrade`, and rollback the latest migration by `flask db downgrade`.
1. Query the current migration status of the database via `flask db status`.

Migration scripts must be stored in `back/boxtribute_server/migrations`, and are put under version-control.

For an example migration, see `docs/peewee-moves/`.
