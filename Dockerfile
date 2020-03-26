FROM ubuntu:18.04
RUN mkdir /code
WORKDIR /code
ENV FLASK_APP server.py
ENV FLASK_RUN_HOST 127.0.0.1:5000
COPY requirements.txt requirements.txt
RUN apt-get update -y && apt-get install -y python-pip python-dev && \
    apt-get install -y libmysqlclient-dev python-dev && pip install -r requirements.txt
COPY . .
CMD ["flask","run"]
