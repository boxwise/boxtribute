"""Computation of various metrics"""

from datetime import date, datetime, timedelta, timezone

from peewee import fn

from ...db import db
from ...enums import TargetType
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.transaction import Transaction
from ...models.utils import execute_sql, utcnow
from ...utils import in_ci_environment, in_production_environment
from ..statistics.sql import MOVED_BOXES_ALL_BASES_QUERY


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


def compute_moved_boxes_statistics():
    # copied from statistics module)
    min_history_id = 1
    if in_production_environment() and not in_ci_environment():
        # Earliest row ID in tables in 2023
        min_history_id = 1_324_559

    facts = execute_sql(
        min_history_id,
        TargetType.BoxState.name,
        TargetType.BoxState.name,
        TargetType.OutgoingLocation.name,
        TargetType.OutgoingLocation.name,
        TargetType.Shipment.name,
        TargetType.BoxState.name,
        database=db.replica or db.database,
        query=MOVED_BOXES_ALL_BASES_QUERY,
    )

    today = utcnow().date()

    moved_boxes_last_month = 0
    moved_boxes_last_quarter = 0
    moved_boxes_last_year = 0

    for fact in facts:
        moved_on = fact.get("moved_on")
        if moved_on is None:
            continue

        if not isinstance(moved_on, date):
            continue

        days_ago = (today - moved_on).days

        boxes_count = fact.get("boxes_count", 0)

        if days_ago <= 30:
            moved_boxes_last_month += boxes_count
        if days_ago <= 90:
            moved_boxes_last_quarter += boxes_count
        if days_ago <= 365:
            moved_boxes_last_year += boxes_count

    return {
        "moved_boxes_last_month": moved_boxes_last_month,
        "moved_boxes_last_quarter": moved_boxes_last_quarter,
        "moved_boxes_last_year": moved_boxes_last_year,
    }
