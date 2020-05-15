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

#### Formatting

Right now we are using Black for formatting. To format a file, use `black {source_file_or_directory}`. Auto-formatting to be implemented later. 