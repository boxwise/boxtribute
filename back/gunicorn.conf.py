"""Configuration for gunicorn WSGI server. For possible settings see
https://docs.gunicorn.org/en/stable/settings.html#
"""
workers = 1
threads = 1
bind = "0.0.0.0:5000"
wsgi_app = "boxtribute_server.main:app"
# loglevel = "debug"
