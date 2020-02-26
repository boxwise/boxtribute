# boxwise-flask
This is a simple flask app to be used together with the react-client for development purposes

------

I dockerized the flask-app and set it up to connect to the current development mysql-database of the php-backend.
After cloning the repository you should be able to build the container with 

### `docker compose-up --build`

The database is a copy of the testdatabase of the php-version created by mysqldump dropapp_dev > init.sql

