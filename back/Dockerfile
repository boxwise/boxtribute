ARG flask_env

# using alpine for smallest docker image
FROM python:3.8-alpine AS base

RUN apk add --update gcc libffi-dev
RUN apk add --update musl-dev
RUN apk add --update build-base

WORKDIR /app/back
# install packages separately to use docker build-caching so we don't need to
# re-fetch these if code has changed but our requirements.txt hasn't
COPY requirements.txt /app/back
RUN pip install -r requirements.txt && rm requirements.txt

# Build two stages for the conditions production/development
# cf. https://stackoverflow.com/a/60820156/3865876
FROM base AS production
# Launch WSGI server, configured by gunicorn.conf.py
ENV FLASK_ENV production
CMD gunicorn

FROM base AS development
# Path of module containing Flask app, relative to WORKDIR
ENV FLASK_APP boxtribute_server/main
ENV FLASK_ENV development
CMD flask run -h 0.0.0 -p 5000

# Select final stage depending on flask_env argument
FROM ${flask_env} AS final
RUN echo Using $FLASK_ENV
