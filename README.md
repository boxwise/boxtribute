# boxwise-flask
This is a simple flask app to be used together with the react-client for development purposes

------

This is a docker container around the flask backend, to be used together with the react-app. This connects to a copy of the  development mysql-database of the php-backend. Since this is a simple mysqldumb , it may not be up to date.

------

After cloning the repository you should be able to build the container with 

### docker-composer up --build

After building succesfully, the database can be accessed with the command:

### docker exec -it CONTAINERNAME mysql -uroot -p
 
The password is **dropapp_root**. If the database is accessed there should be an existing database dropapp_dev, and within this there should be data. If this is not the case, remove the db-docker container by **docker rm CONTAINERNAME** and try to rebuild.

-------

After successfully setting up the database you have to set the values **AUTH0-DOMAIN** as well as **API_AUDIENCE**  in the **server.py** file with the values gathered from the AUTH0 project. These should correspond to the ones used in the react-app.


