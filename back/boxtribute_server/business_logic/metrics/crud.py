"""Computation of various metrics"""

from datetime import datetime, timedelta, timezone

from peewee import fn

from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.organisation import Organisation
from ...models.definitions.services_relation import ServicesRelation
from ...models.definitions.transaction import Transaction
from ...models.utils import HISTORY_CREATION_MESSAGE, HISTORY_DELETION_MESSAGE, utcnow


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


def number_of_created_records_between(model, start, end):
    return (
        model.select()
        .where((model.created_on >= start) & (model.created_on <= end))
        .count()
    )


def number_of_boxes_created_between(start, end):
    return (
        Box.select(
            Organisation.name.alias("organisation_name"),
            Base.name.alias("base_name"),
            fn.COUNT(Box.id).alias("number"),
        )
        .join(Location)
        .join(Base)
        .join(Organisation)
        .where(
            Box.created_on >= start,
            Box.created_on <= end,
        )
        .group_by(Organisation.id, Base.id)
    )


def number_of_beneficiaries_registered_between(start, end):
    # Beneficiaries might be hard-deleted from the people table, hence we have to use
    # the history table for reliable information about their creation
    return (
        DbChangeHistory.select(
            Organisation.name.alias("organisation_name"),
            Base.name.alias("base_name"),
            fn.COUNT(Beneficiary.id).alias("number"),
        )
        .join(
            Beneficiary,
            on=(
                (DbChangeHistory.table_name == Beneficiary._meta.table_name)
                & (Beneficiary.id == DbChangeHistory.record_id)
                & (DbChangeHistory.changes == HISTORY_CREATION_MESSAGE)
            ),
        )
        .join(Base)
        .join(Organisation)
        .where(
            DbChangeHistory.change_date >= start,
            DbChangeHistory.change_date <= end,
        )
        .group_by(Organisation.id, Base.id)
    )


def reached_beneficiaries_numbers(start, end):
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
    return (
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
    ).count()


def get_time_span(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    duration_days: int | None = None
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
