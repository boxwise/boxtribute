from test.mock_decorator import mock_decorator
from unittest.mock import patch

patch("boxwise_flask.auth_helper.requires_auth", mock_decorator()).start()
