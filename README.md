# boxwise-flask
This is a simple flask app to be used together with the react-client for development purposes

------

I dockerized the flask-app and set it up to connect to the current development mysql-database of the php-backend.
After cloning the repository you should be able to build the container with 

### `docker build . -t flask_server`

and afterwards running it by 

### `docker run --network="host" -it flask_server`

If successful, after accessing your localhost this will print out the raw products-table from the testdatabase.

