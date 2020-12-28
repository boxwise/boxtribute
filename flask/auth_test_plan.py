def get_token_auth_header():
  mock the flask request header with
  valid
  invalid data:
    bearer doesnt start with bearer
    doesnt have authorization in header

def get_rsa_key(token):
  this function gets a json web key from auth0 from a token
  create a valid test token and verify it correctly retrieves it from auth0
  if it returns None its not worked
  try with invalid token as well and make sure it returns None

def decode_jwt(token, rsa_key):
  this function is only ran with valid keys
  but maybe good to add some checks into the function to make sure things are valid
  maybe try and create an expired token and one with a jwtclaims error

def requires_auth(f):
  this function wraps request endpoints to check auth tokens
  the other test should be sufficient to test this may need some help deciding the best way to go about this
  maybe integration tests

def authorization_test(test_for, **kwargs):
  this function tests individual auth for each user
  test individual functions this function may need to be tested with integrations

def user_can_access_base(requesting_user, base_id):
  this is fairly easy to test with some test data
  give a valid user and invalid user

def get_token_auth_header():
def get_rsa_key(token):
def decode_jwt(token, rsa_key):
def requires_auth(f):
def authorization_test(test_for, **kwargs):
def user_can_access_base(requesting_user, base_id):

def test_decode_valid_jwt():

def test_user_can_access_base_valid_user():

def test_user_can_access_base_no_base_ids():

def test_user_can_access_base_invalid_base_ids():

def test_authorization_test_bases_valid():


def test_authorization_test_bases_invalid():
