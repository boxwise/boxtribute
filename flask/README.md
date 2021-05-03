## Readme

## Table of Contents

1. [Contribution Guidelines](../CONTRIBUTING.md)
2. [Development Set-up](#development-set-up)
   1. [Install python](#install-python)
   2. [Set-up pre-commit](#set-up-pre-commit)
   3. [Linting and Formatting in VSCode](#linting-and-formatting-in-vscode)
   4. [Working with MySQL](#working-with-mysql)
   5. [Debugging](#debugging)
3. [Testing](#testing)
4. [GraphQL Playground](#graphql-playground)
5. [Authentication and Authorization on the back-end](#authentication-and-authorization)
6. [Database Migrations](#database-migrations)

## Development Set-up

### Install python

For almost all features of our development set-up you should [install Python >=3.6](https://www.python.org/downloads/) on your computer. You will need it to run tests on the back-end and the formatters and linters on both back-end and front-end.

**Additional must-haves for back-end people**
[Make use of virtual environments like venv.](https://docs.python.org/3/library/venv.html) You should not install all packages you need for this project globally, but focused on Boxtribute.

**Further recommendations**
These recommendations are mainly meant for people developing on the back-end. If you are just a front-end person, but would like use pre-commit and the linters and formatters defined there, you can skip these steps.

- [Use a version control for python like pyenv.](https://github.com/pyenv/pyenv) It provides you with much more clarity which version you are running and makes it easy to switch versions of python.
- [Have a look at direnv >= v2.21.0](https://github.com/direnv/direnv). Virtual environments must be activated and deactivated. If you are moving through folders in the terminal it can easily happen that you either miss activating or deactivating the venv resulting in errors and time wasted for development. With direnv you can automate the activation and deactivation of venv depending on which folder you are in. There is already a `.envrc` file in the root of this repo. If you install `direnv` and allow to run it for your local repo, it will activate the python virtual environment `venv` everytime you enter the folder via a command line.

### Set-up pre-commit

[Pre-commit](https://pre-commit.com/) enables us to run code quality checks, such as missing semicolons, trailing whitespace, and debug statements, before you are committing your code. We chose pre-commit since it enables us to run these checks for both front-end and back-end in just one place.
Please follow these steps to set-up pre-commit:

(optional) 0.1 If you have not already done it, create a venv in which you are running pre-commit. If you are using pyenv you might want to check which python version you are using with `pyenv version` or `which python`.

    python3 -m venv .venv

(optional) 0.2 Activate the virtual environment. If you are not using direnv, be aware that you should do this step each time before working with python in the Boxtribute repo.

    source .venv/bin/activate

1.  Install pre-commit and the linters/formatters (all declared in `/flask/requirements-dev.txt`). Run the command from the root folder of the repo

        pip install -e flask -r flask/requirements-dev.txt

2.  Install the hooks to run pre-commit before you commit.

        pre-commit install --overwrite

Now you're all set up using Python code quality tools! `pre-commit` automatically checks the staged patch before committing. If it rejects a patch, add the corrections and try to commit again.

To figure out what else you can do with pre-commit, check out this [link](https://pre-commit.com/#usage).

### Linting and Formatting in VSCode

Most of our developers are using VSCode. Instead of running our linter (flake8) and our formatter (black) for python just when you are committing your code, we added a few settings in `.vscode/settings.json` so that your files are formatted and linted when you save a python file. You might want to check out this settings file.

### Working with MySQL

Since we are working with docker you do not have to install a local MySQL server on your computer. Instead, you can just connect to the MySQL server in one of the Docker containers.

#### General notes on Docker network

In the docker-compose file we define a separate docker network called `backend` to which the back-end containers are joined. Each container can now look up the hostname `flask` or `mysql` and get back the appropriate container’s IP address.
To access the mysql database, there are now two possibilities:

1. You reach the mysql db at `MYSQL_HOST=mysql` and `MYSQL_PORT=3306` or
2. by specifying the IP-address of the gateway for `MYSQL_HOST` and `MYSQL_PORT=32000`.

To figure out the gateway of the docker network `backend` run

        docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' boxtribute_backend

#### MySQL workbend or other editors

Most of our developers use [MySQL workbench](https://dev.mysql.com/doc/workbench/en/wb-installing.html) to interact with the database directly. If you want to connect to the database, choose one of the possibilites in the former to define the conneection, e.g. Hostname is 172.18.0.1 and Port is 32000.

The development database is called `dropapp_dev` and the password is `dropapp_root`.

### Debugging

By default the flask app runs in `development` mode in the Docker container which means that hot-reloading and debugging is enabled.

#### Built-in flask debugger

For debugging an exception in an endpoint, direct your webbrowser to that endpoint. The built-in flask debugger is shown. You can attach a console by clicking the icons on the right of the traceback lines. For more information, refer to the [documentation](https://flask.palletsprojects.com/en/1.1.x/quickstart/#debug-mode).

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
If you want to debug a certain endpoint, set a break-point in the endpoint and call this enpoint at the port 5001, e.g.
`localhost:5001/api/public`
If you want to break on any other code lines (not endpoints), then you can only catch them during the server start-up.

#### Usage of Logger

To log to the console from inside the docker container, create an instance of app using:

    from flask import Flask
    app = Flask(__name__)

and log with:

    app.logger.warn(<whatever you want to log>)

## Testing

### Writing tests

Run the test suite on your machine by executing

    pytest

Two types of tests can be setup. Model (unit) tests and endpoint (integration) tests.

New test files should begin with the word test so the they are discovered when running pytest.
for example:

    test_<test_file_name>.py

and similarly the test functions should have the format

    def test_<test_name>():

For endpoint testing, the test functions usually take one fixture along with the required data fixtures.

    @pytest.mark.usefixtures("<data_fixture_name>")
    def test_<test_name>(client, <data_fixture_name>):

to allow for databases to be preconfigured with data and requests to be made to the app.

Fixtures are configured in the `conftest.py` files which execute automatically before a test.

### Setting up test data

Test data is setup in the `test/data` folder and each piece of data is split up into 3 seperate parts

1.  The default data function is a dictionary which has all of the data for that database table

        def default_<data_name>_data():

2.  The fixture passes this data into the required tests

        @pytest.fixture()
        def default_<data_name>():

3.  the creation function is called on the setup of a test so that all of the data is in the database when the test is ran

        def create_default_<data_name>():
            <data_model>.create(**default_<data_name>_data())

#### Please be aware that

- for new data the fixtures need to be imported in the required `conftest.py` and
- the call to create needs to be added to `setup_tables.py` in the `test/data` directory.

### Coverage analysis

From the repository root, run

    pytest --cov --cov-report=term --cov-report=html flask

and inspect the reported output. Open the HTML report via `flask/htmlcov/index.html` to browse coverage for individual source code files.

## GraphQL Playground

We are setting up GraphQL as a data layer for this application. To check out the GraphQL playground, and go to `localhost:5000/graphql`.
The GraphQL enpoint is secured and needs a Bearer token from Auth0 to authenticate and authorize. To work with the playground you have to add such a token from Auth0 as an http Header. Here, how this works:

1.  Follow this [link](https://manage.auth0.com/dashboard/eu/boxtribute-dev/apis/5ef3760527b0da00215e6209/test) to receive a token for testing. You can also find this token in Auth0 in the menu > API > boxtribute-dev-api > Test-tab.

2.  Insert the access token in the following format on the playground in the section on the bottom left of the playground called HTTP Headers.

        { "authorization": "Bearer <the token you retrieved from Auth0>"}

A sample query you can try if it works is:

    query {
        allBases {
            name
        }
    }

## Authentication and Authorization

## Database Migrations
