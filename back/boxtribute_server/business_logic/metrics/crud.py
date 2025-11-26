"""Computation of various metrics"""

from datetime import datetime, timedelta, timezone

from peewee import JOIN, fn

from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.location import Location
from ...models.definitions.transaction import Transaction
from ...models.utils import utcnow


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


def _served_beneficiaries(date_filter):
    """Return IDs of beneficiaries that participated in a sale acc. to given
    `date_filter`.
    """
    return (
        Beneficiary.select(Beneficiary.id)
        .join(Transaction, JOIN.LEFT_OUTER)
        .where((date_filter) & (Transaction.count > 0) & (Transaction.tokens >= 0))
    ).distinct()


def compute_number_of_beneficiaries_served(*, organisation_id, after, before):
    """Like `compute_number_of_families_served` but add up all members of served
    families.
    """
    date_filter = _build_range_filter(Transaction.created_on, low=after, high=before)
    served_beneficiaries = _served_beneficiaries(date_filter)
    return (
        Beneficiary.select()
        .join(Base)
        .where(
            (Base.organisation == organisation_id)
            & (
                (Beneficiary.family_head << served_beneficiaries)
                | (Beneficiary.id << served_beneficiaries)
            )
        )
        .count()
    )


def compute_number_of_families_served(*, organisation_id, after, before):
    """Construct filter for date range, if at least one of `after` or `before` is given.
    Compute number of families managed by `organisation_id` that were served in that
    date range (default to all time).
    """
    date_filter = _build_range_filter(Transaction.created_on, low=after, high=before)
    return (
        Beneficiary.select()
        .join(Base)
        .where(
            (Base.organisation == organisation_id)
            & (Beneficiary.id << (_served_beneficiaries(date_filter)))
        )
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


def compute_stock_overview(*, organisation_id):
    """Compute number of boxes, and number of contained items, managed by
    `organisation_id`.
    """
    overview = (
        Box.select(
            fn.sum(Box.number_of_items).alias("number_of_items"),
            fn.Count(Box.id).alias("number_of_boxes"),
        )
        .join(Location)
        .join(Base)
        .where(
            (Base.organisation == organisation_id)
            & (Location.visible == 1)
            & (Location.is_lost != 1)
            & (Location.is_scrap != 1)
            & (Location.is_donated != 1)
        )
        .get()
    )
    return {n: getattr(overview, n) for n in ["number_of_boxes", "number_of_items"]}


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
