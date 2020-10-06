
## Readme

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
To log to the console from inside the docker container, create an instance of app using:
    `from flask import Flask`
    `app = Flask(__name__)`

and log with:
        `app.logger.warn(<whatever you want to log>)`
