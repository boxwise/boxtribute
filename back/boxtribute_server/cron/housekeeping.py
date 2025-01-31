from ..db import db


def clean_up_user_email_addresses():
    """Remove excessive '.deleted.X' suffix from user email addresses. Return number of
    updated rows.
    """
    with db.database.atomic():
        cursor = db.database.execute_sql(
            r"""
UPDATE cms_users
SET email = SUBSTRING_INDEX(email, '.deleted.', 2)
WHERE email REGEXP '\\.deleted\\.\\d+\\.deleted\\.\\d+$'
;
"""
        )
        return db.database.rows_affected(cursor)
