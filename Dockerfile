FROM python:3.8-slim-buster
RUN mkdir /codedir
WORKDIR /codedir
ENV FLASK_APP main
RUN apt-get update -y && apt-get install -y libmariadb-dev
COPY requirements.txt .
RUN pip install -r requirements.txt && rm requirements.txt
CMD flask run --host=0.0.0.0
