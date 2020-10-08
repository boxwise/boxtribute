from datetime import date, datetime

from boxwise_flask.models.user import User


def test_user_creation():
    """Verify inserting test rows."""

    user = {
        "name": "a",
        "email": "a@b.com",
        "valid_firstday": date.today(),
        "valid_lastday": date.today(),
        "lastlogin": datetime.now(),
        "lastaction": datetime.now(),
        "pass_": "pass",
        "is_admin": 0,
        "created": datetime.now(),
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "resetpassword": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    User.create(**user)
    # x = User.get_all_bases()
    x = User.select().get()
    assert x.name == user["name"]
