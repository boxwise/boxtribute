from peewee import fn

from ..db import db
from ..models.definitions.user import User


def clean_up_user_email_addresses():
    """Remove excessive '.deleted.X' suffix from user email addresses. Return number of
    updated rows.
    """
    with db.database.atomic():
        return (
            User.update(email=fn.SUBSTRING_INDEX(User.email, ".deleted.", 2))
            .where(User.email.iregexp(r"\.deleted\.\d+\.deleted\.\d+$"))
            .execute()
        )
