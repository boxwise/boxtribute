from patches import get_auth_string_patch
from patches import authorization_test_patch
from patches import requires_auth_patch

# Patch the function to get auth token from request header
get_auth_string_patch.start()
# as we are testing the auth functions here stop the patches that effect this
authorization_test_patch.stop()
requires_auth_patch.stop()