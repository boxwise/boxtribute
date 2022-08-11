ARG env

# using alpine for smallest docker image
FROM python:3.10.4-alpine3.15 AS base

WORKDIR /app/back
# install packages separately to use docker build-caching so we don't need to
# re-fetch these if code has changed but our requirements.txt hasn't
COPY requirements.txt /app/back
RUN pip install -r requirements.txt && rm requirements.txt

# Build two stages for the conditions production/development
# cf. https://stackoverflow.com/a/60820156/3865876
FROM base AS production
# Launch WSGI server, configured by gunicorn.conf.py
CMD gunicorn

FROM base AS development
# Path of module containing Flask app, relative to WORKDIR
CMD flask --debug --app boxtribute_server.main run -h 0.0.0 -p 5000

# Select final stage depending on env argument
FROM ${env} AS final
