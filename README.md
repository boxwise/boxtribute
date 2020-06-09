# Readme
This is a simple flask app to be used together with the [react-client](https://github.com/boxwise/boxwise-react) for the revamp of [Boxwise](www.boxwise.co)

### Preparation for Installation

* Install [Docker](https://www.docker.com/products/docker-desktop)
* Get an invite to the development tenant of [Auth0](https://auth0.com/) for Boxwise.

### How do I get set up?

1. Create an `.env`-file  from the file `example.env` and add values for [`AUTH0-DOMAIN` and `API_AUDIENCE`](https://auth0.com/docs/dashboard/reference/settings-application). Please use the same ones as for the corresponding [react-client](https://github.com/boxwise/boxwise-react).

2. To run the application, we assume you have Docker installed. You can then run:

       docker-compose up

### Database

-----

:warning: The initial database seed is a copy of mysql-database of the [old dropapp project](https://github.com/boxwise/boxwise-dropapp). Since this is a simple mysqldump, it may not be up to date.

-----

#### Command-line access

If you want to connect to the MySQL server from your host machine, you can do this using

    docker exec -it <name of the db-docker container, e.g. boxwise-flask_mysql_1> mysql -u root -p

The mysql server in your docker container is also reachable on port `32000` of your localhost

    mysql --host=127.0.0.1 --port=32000 -u root -p

The password for the root-user for the db `dropapp_dev` is `dropapp_root`.

#### MySQL workbench access

Most of us use workbench to access the MySQL database. To establish a connection you need to enter your `localhost`-address, e.g. `127.0.0.1`, for 'Hostname' and `32000` for 'Port'.

#### Re-seed your database

At the moment it is easiest if remove your db-docker container with

    docker rm <name of the db-docker container, e.g. boxwise-flask_mysql_1>

and restart it afterwards.This is only a short-term solution for now.

### Development

This project is developed in Python >= 3.6. For setting up the development environment, first create a Python virtual environment, e.g. by

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements-dev.txt
    pre-commit install --overwrite

Now you're all set up using Python code quality tools! `pre-commit´ automatically checks the staged patch before committing. If it rejects a patch, add the corrections and try to commit again.

#### Formatting and linting

Run a full style-check by

    pre-commit run --all-files

#### Debugging

By default the flask app runs in `development` mode which has hot-reloading and debugging enabled.

For debugging an exception in an endpoint, direct your webbrowser to that endpoint. The built-in flask debugger is shown. You can attach a console by clicking the icons on the right of the traceback lines. For more information, refer to the [documentation](https://flask.palletsprojects.com/en/1.1.x/quickstart/#debug-mode).

#### GraphQL
We are setting up GraphQL as a data layer for this application. To check out the playground, run this project with the above docker-compose instructions, and go to localhost:5000/graphql. A sample query you can try is:
```
query {
  allCamps {
    name
  }
}
```

### License
See the LICENSE file for license rights and limitations (Apache 2.0).
