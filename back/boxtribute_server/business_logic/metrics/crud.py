"""Computation of various metrics"""

import os
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from peewee import SQL, NodeList, fn

from ...cli.service import ServiceBase
from ...enums import TaggableObjectType
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.organisation import Organisation
from ...models.definitions.services_relation import ServicesRelation
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.utils import HISTORY_CREATION_MESSAGE, HISTORY_DELETION_MESSAGE, utcnow
from ...utils import in_production_environment


def _build_range_filter(field, *, low, high):
    """Construct filter for range on specified model field, if at least one of `low` or
    `high` is given.
    Otherwise return True for non-effective filtering.
    """
    filter_ = True
    if low and high:
        filter_ = field.between(low, high)
    elif low:
        filter_ = field > low
    elif high:
        filter_ = field < high
    return filter_


def compute_number_of_families_served(*, organisation_id, after, before):
    """Construct filter for date range, if at least one of `after` or `before` is given.
    Compute number of families managed by `organisation_id` that were served in that
    date range (default to all time).
    """
    date_filter = _build_range_filter(Transaction.created_on, low=after, high=before)
    return (
        # Transactions are always assigned to the family head
        Transaction.select(Transaction.beneficiary.distinct())
        .join(Beneficiary)
        .join(Base)
        .where(
            Base.organisation == organisation_id,
            date_filter,
            Transaction.count > 0,
        )
        # Multiple transactions for one checkout should be counted once
        .group_by(Transaction.beneficiary, Transaction.created_on)
        .count()
    )


def compute_number_of_sales(*, organisation_id, after, before):
    """Construct filter for date range, if at least one of `after` or `before` is given.
    Compute number of sales performed by `organisation_id` in that date range (default
    to all time).
    """
    date_filter = _build_range_filter(Transaction.created_on, low=after, high=before)
    return (
        Transaction.select(fn.sum(Transaction.count))
        .join(Beneficiary)
        .join(Base)
        .where(
            (date_filter)
            & (Base.organisation == organisation_id)
            & (Transaction.tokens >= 0)
        )
        .scalar()  # returns None if no Transactions selected
        or 0
    )


def exclude_test_organisation():
    if in_production_environment():
        return (Organisation.id != 1) | Organisation.id.is_null()
    return True


def number_of_boxes_created_between(start, end):
    return (
        Box.select(
            Organisation.id.alias("organisation_id"),
            Organisation.name.alias("organisation_name"),
            Base.id.alias("base_id"),
            Base.name.alias("base_name"),
            fn.COUNT(Box.id).alias("number"),
        )
        .join(Location)
        .join(Base)
        .join(Organisation)
        .where(
            Box.created_on >= start,
            Box.created_on <= end,
            exclude_test_organisation(),
        )
        .group_by(Organisation.id, Base.id)
    ).dicts()


def number_of_beneficiaries_registered_between(start, end):
    # Beneficiaries might be hard-deleted from the people table, hence we have to use
    # the history table for reliable information about their creation. However some
    # beneficiaries might have been directly imported into the DB without creating
    # history entries, we then fallback to using Beneficiary.created_on. Unfortunately,
    # if these beneficiaries are fully-deleted, we lose their information and the
    # statistic becomes imprecise. A fix will come with https://trello.com/c/SYHi6Rj8
    RegisteredBeneficiaries = (
        DbChangeHistory.select(DbChangeHistory.record_id.alias("id")).where(
            DbChangeHistory.table_name == Beneficiary._meta.table_name,
            DbChangeHistory.change_date >= start,
            DbChangeHistory.change_date <= end,
            DbChangeHistory.changes == HISTORY_CREATION_MESSAGE,
        )
    ) | (
        # created acc. to people table (contains info for some beneficiaries
        # directly imported to the DB but misses permanently deleted beneficiaries)
        Beneficiary.select(Beneficiary.id).where(
            Beneficiary.created_on >= start,
            Beneficiary.created_on <= end,
        )
    )
    return (
        Beneficiary.select(
            Organisation.id.alias("organisation_id"),
            Organisation.name.alias("organisation_name"),
            Base.id.alias("base_id"),
            Base.name.alias("base_name"),
            fn.COUNT(RegisteredBeneficiaries.c.id).alias("number"),
        )
        .from_(RegisteredBeneficiaries)
        .left_outer_join(
            Beneficiary, on=(Beneficiary.id == RegisteredBeneficiaries.c.id)
        )
        .left_outer_join(Base)
        .left_outer_join(Organisation)
        .where(exclude_test_organisation())
        .group_by(Organisation.id, Base.id)
        .order_by(Organisation.id, Base.id)
    ).dicts()


def number_of_beneficiaries_reached_between(start, end):
    # Return UNION of five sources of beneficiaries reached in given time span
    # Known issues with this statistic as of 2025.12.15:
    # - Deleted bene's create issues in the transactions table (NULL people_id for free
    #   shop checkouts)
    # - Deleted bene's are not associated with a base (creates attribution errors)
    # - Does not account for the case where there are special free shop distributions
    #   for children (around 3% of total transactions)
    # - There are 19 beneficiaries who have themselves as both a child and head of the
    #   family, and we did not identify the error in the data capture yet (last case was
    #   in 2023).
    # Though the DbChangeHistory, Transaction, ServicesRelation models have one-to-many
    # relationships with Beneficiary we don't have to use DISTINCT because UNION takes
    # care of removing the duplicates
    ReachedBeneficiaries = (
        (
            # created/edited (persistently logged in history table)
            DbChangeHistory.select(DbChangeHistory.record_id.alias("id")).where(
                DbChangeHistory.table_name == Beneficiary._meta.table_name,
                DbChangeHistory.change_date >= start,
                DbChangeHistory.change_date <= end,
                # Exclude "Record deleted [by dailyroutine|without undelete]"
                ~DbChangeHistory.changes.startswith(HISTORY_DELETION_MESSAGE),
            )
        )
        | (
            # created acc. to people table (contains info for some beneficiaries
            # directly imported to the DB but misses permanently deleted beneficiaries)
            Beneficiary.select(Beneficiary.id).where(
                Beneficiary.created_on >= start,
                Beneficiary.created_on <= end,
            )
        )
        | (
            # involved in transactions (family heads)
            Transaction.select(Transaction.beneficiary.alias("id")).where(
                Transaction.created_on >= start,
                Transaction.created_on <= end,
                Transaction.count > 0,
                # Exclude transactions of permanently deleted beneficiaries
                Transaction.beneficiary.is_null(False),
            )
        )
        | (
            # indirectly involved in transactions (family members)
            Beneficiary.select(Beneficiary.id).where(
                fn.EXISTS(
                    Transaction.select().where(
                        Transaction.beneficiary == Beneficiary.family_head,
                        Transaction.created_on >= start,
                        Transaction.created_on <= end,
                        Transaction.count > 0,
                    )
                ),
                # Filter out beneficiaries registered as their own family heads
                Beneficiary.id != Beneficiary.family_head,
            )
        )
        | (
            # involved in services
            # If a beneficiary is registered twice for the same service than you have
            # the same pair of beneficiary/service but a different created_on
            ServicesRelation.select(ServicesRelation.beneficiary.alias("id")).where(
                ServicesRelation.created_on >= start,
                ServicesRelation.created_on <= end,
            )
        )
        | (
            TagsRelation.select(TagsRelation.object_id.alias("id")).where(
                TagsRelation.object_type == TaggableObjectType.Beneficiary,
                TagsRelation.created_on >= start,
                TagsRelation.created_on <= end,
            )
        )
    )
    return (
        Beneficiary.select(
            Organisation.id.alias("organisation_id"),
            Organisation.name.alias("organisation_name"),
            Base.id.alias("base_id"),
            Base.name.alias("base_name"),
            fn.COUNT(ReachedBeneficiaries.c.id).alias("number"),
        )
        .from_(ReachedBeneficiaries)
        .left_outer_join(Beneficiary, on=(Beneficiary.id == ReachedBeneficiaries.c.id))
        .left_outer_join(Base)
        .left_outer_join(Organisation)
        .where(exclude_test_organisation())
        .group_by(Organisation.id, Base.id)
    ).dicts()


def compute_total(data):
    return sum(row["number"] for row in data)


def get_time_span(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    duration_days: int | None = None,
) -> tuple[datetime, datetime]:
    """
    Calculates a time span (start_date, end_date) given one or two of three possible
    inputs.

    :param start_date: The start date (earlier than the end date)
    :param end_date: The end date
    :param duration_days: The duration in days (integer).
    :return: A tuple (calculated_start_date, calculated_end_date).
    :raises ValueError: If insufficient or contradictory arguments are provided.
    """
    # 1. Start and End Date are provided (Highest Priority)
    if start_date and end_date:
        if start_date > end_date:
            raise ValueError("Start date cannot be after the end date.")
        return (start_date, end_date)

    # 2. Start Date and Duration are provided
    elif start_date and duration_days is not None:
        if duration_days < 0:
            raise ValueError("Duration cannot be negative.")
        calculated_end_date = start_date + timedelta(days=duration_days)
        return (start_date, calculated_end_date)

    # 3. End Date and Duration are provided
    elif end_date and duration_days is not None:
        if duration_days < 0:
            raise ValueError("Duration cannot be negative.")
        calculated_start_date = end_date - timedelta(days=duration_days)
        return (calculated_start_date, end_date)

    # 4. Only Duration provided, end date defaults to today
    elif duration_days is not None:
        if duration_days < 0:
            raise ValueError("Duration cannot be negative.")
        end_date = utcnow()
        calculated_start_date = end_date - timedelta(days=duration_days)
        return (calculated_start_date, end_date)

    # 5. Only Start Date provided, end date defaults to today
    elif start_date is not None:
        start_date = start_date.replace(tzinfo=timezone.utc)
        end_date = utcnow()
        if start_date > end_date:
            raise ValueError("Start date cannot be after the end date.")
        return (start_date, end_date)

    # 5. Insufficient parameters
    else:
        raise ValueError("Insufficient arguments")


def get_data_for_number_of_active_users():
    """Find users who logged in within the last two years by querying the Auth0
    management API.
    Prepare users data and corresponding organisation data.
    """
    domain = os.environ["AUTH0_MANAGEMENT_API_DOMAIN"]
    client_id = os.environ["AUTH0_MANAGEMENT_API_CLIENT_ID"]
    secret = os.environ["AUTH0_MANAGEMENT_API_CLIENT_SECRET"]

    auth0_service = ServiceBase.connect(
        domain=domain, client_id=client_id, secret=secret
    )

    two_years_ago = date.today() - timedelta(days=2 * 365)
    query = f"last_login:[{two_years_ago.isoformat()} TO *]"
    fields = ["app_metadata", "last_login"]
    try:
        users = auth0_service.get_users(query=query, fields=fields)
    except Exception:
        # If querying from Auth0 fails for some reason, try again in the next
        # iteration without crashing the entire cron job
        return []

    org_ids = set()
    for user in users:
        last_login = user.get("last_login")
        # Parse ISO 8601 datetime string
        login_date = datetime.fromisoformat(last_login.replace("Z", "+00:00"))
        user["last_login"] = login_date
        app_metadata = user.get("app_metadata", {})
        org_id = app_metadata.get("organisation_id")
        if org_id:
            org_ids.add(org_id)

    # Load organisation and base data from database
    # For multi-base organisations, it's not possible to determine the base which the
    # user logged in onto (also, they might switch base while using the app). In this
    # case we use all bases of the organisation that were active in the last year (the
    # base with smallest ID serves as base_id, and the concatenated base names are
    # base_name)
    one_year_ago = date.today() - timedelta(days=365)
    org_base_info = (
        Organisation.select(
            Organisation.id.alias("organisation_id"),
            Organisation.name.alias("organisation_name"),
            fn.MIN(Base.id).alias("base_id"),
            fn.GROUP_CONCAT(NodeList((Base.name, SQL("ORDER BY"), Base.id))).alias(
                "base_name"
            ),
        )
        .left_outer_join(Base)
        .where(
            Organisation.id << org_ids,
            Base.deleted_on.is_null() | (Base.deleted_on >= one_year_ago),
            exclude_test_organisation(),
        )
        .group_by(Organisation.id)
    ).dicts()

    return users, list(org_base_info)


def number_of_active_users_between(start, end, users, org_base_info):
    """Compute number of active users per organisation between start and end dates.

    Returns a list of dicts with organisation ID, organisation name, base IDs,
    base names, and number of users logged in.
    """
    # Filter users by last_login date range
    filtered_users = [user for user in users if start <= user["last_login"] <= end]

    # Group users by organisation ID
    org_users = defaultdict(list)
    for user in filtered_users:
        app_metadata = user.get("app_metadata", {})
        org_id = app_metadata.get("organisation_id")
        if org_id:
            org_users[org_id].append(user)

    # Build result with user counts
    result = []
    for row in org_base_info:
        org_id = row["organisation_id"]
        result.append(row | {"number": len(org_users[org_id])})

    return result
