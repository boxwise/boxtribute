FROM python:3.8-slim-buster
RUN mkdir /code
WORKDIR /code
ENV FLASK_APP server.py
ENV FLASK_RUN_HOST 127.0.0.1:5000
COPY requirements.txt requirements.txt
RUN apt-get update -y && apt-get install -y python3-pip python3-dev && \
    apt-get install -y libmariadb-dev python3-dev && pip install -r requirements.txt
COPY . .
#CMD ["flask","run"]
CMD flask run --host=0.0.0.0
