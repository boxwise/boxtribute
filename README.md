# boxwise-flask
This is a simple flask app to be used together with the react-client for development purposes

------

I dockerized the flask-app and set it up to connect to the current development mysql-database of the php-backend.
After cloning the repository you should be able to build the container with 

### `docker-composer up --buld`

If successful, after accessing your localhost this will print out the raw products-table from the testdatabase.

