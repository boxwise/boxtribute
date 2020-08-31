# using alpine for smallest docker image
FROM python:3.8-alpine
WORKDIR /app/flask
# install packages seperately to use docker build-caching
# so we don't need to re-fetch these if code has changed
# but our package.json hasn't
COPY requirements.txt /app/flask
RUN pip install -r requirements.txt && rm requirements.txt
# Path of module containing flask app, relative to WORKDIR
ENV FLASK_APP boxwise_flask/main
CMD flask run -h 0.0.0 -p 5000
