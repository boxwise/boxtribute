"""Configuration for gunicorn WSGI server. For possible settings see
https://docs.gunicorn.org/en/stable/settings.html#
"""

# This setting will be overridden in the v2-production GAE instance
workers = 2
threads = 1
bind = "0.0.0.0:5005"
# loglevel = "debug"
