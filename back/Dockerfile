ARG env

# using alpine for smallest docker image
FROM python:3.12.0a1-alpine3.15 AS base

WORKDIR /app
# install packages separately to use docker build-caching so we don't need to
# re-fetch these if code has changed but our requirements.txt hasn't
COPY requirements.txt /app
COPY requirements-dev.txt /app
RUN pip install -r requirements.txt -r requirements-dev.txt && rm requirements*.txt

# Simulate editable install for boxtribute-server package. This is required to resolve imports
# (editable installing is not possible during Docker build since the code directory is only
# mounted at container runtime)
RUN echo "/app/back" > /usr/local/lib/python3.10/site-packages/boxtribute-server.egg-link
ENV PYTHONPATH=/app/back

# Build two stages for the conditions production/development
# cf. https://stackoverflow.com/a/60820156/3865876
FROM base AS production
# Launch WSGI server, configured by gunicorn.conf.py
CMD gunicorn --config back/gunicorn.conf.py boxtribute_server.main:app

FROM base AS development
# Path of module containing Flask app, relative to WORKDIR
CMD flask --debug --app back/boxtribute_server/main.py run -h 0.0.0 -p 5005

# Select final stage depending on env argument
FROM ${env} AS final
