"""Computation of various metrics"""

from datetime import datetime, timedelta

from peewee import JOIN, fn

from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.transaction import Transaction


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


def family_heads_edited_last_year():
    cutoff_datetime = datetime.today() - timedelta(days=365)
    cutoff_date = cutoff_datetime.date()

    edited_family_heads = (
        DbChangeHistory.select(DbChangeHistory.record_id)
        .where(
            (DbChangeHistory.table_name == "people")
            & (DbChangeHistory.record_id.in_(unique_family_head_ids()))
            & (DbChangeHistory.change_date >= cutoff_date)
        )
        .distinct()
    )

    edited_family_head_id_list = [row.record_id for row in edited_family_heads]
    return edited_family_head_id_list


def family_heads_in_transaction_last_year():
    cutoff_datetime = datetime.today() - timedelta(days=365)
    cutoff_date = cutoff_datetime.date()

    family_head_with_transaction = (
        Transaction.select(Transaction.beneficiary)
        .where(
            (Transaction.beneficiary.in_(unique_family_head_ids()))
            & (Transaction.created_on >= cutoff_date)
        )
        .distinct()
        .tuples()
    )
    return [id[0] for id in family_head_with_transaction]


def unique_family_head_ids():
    family_head_subquery = Beneficiary.select(Beneficiary.family_head_id).where(
        (Beneficiary.family_head_id.is_null(False)) & (Beneficiary.deleted_on.is_null())
    )
    unique_ids = (
        Beneficiary.select(Beneficiary.id)
        .where(Beneficiary.id.in_(family_head_subquery))
        .distinct()
    )
    return unique_ids
