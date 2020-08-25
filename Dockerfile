FROM python:3.8-slim-buster
RUN mkdir /codedir
WORKDIR /codedir
RUN apt-get update -y && apt-get install -y libmariadb-dev
COPY requirements.txt .
RUN pip install -r requirements.txt && rm requirements.txt
# Path of module containing flask app, relative to WORKDIR
ENV FLASK_APP boxwise_flask/main
CMD flask run -h 0.0.0 -p 5000
