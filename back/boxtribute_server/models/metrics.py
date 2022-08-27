"""Computation of various metrics"""
from peewee import JOIN, fn

from .definitions.base import Base
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.classic_location import Location
from .definitions.product import Product
from .definitions.product_category import ProductCategory
from .definitions.transaction import Transaction


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


def compute_moved_stock_overview(*, organisation_id, after, before):
    """Construct filter for date range, if at least one of `after` or `before` is given.
    Compute number of boxes, and contained items, moved by `organisation_id` that were
    served in that date range (default to all time). Group by ProductCategory.
    """
    date_filter = _build_range_filter(Box.last_modified_on, low=after, high=before)

    boxes = (
        Box.select(
            ProductCategory.name,
            fn.sum(Box.number_of_items).alias("number_of_items"),
            fn.Count(Box.id).alias("number_of_boxes"),
        )
        .join(Location)
        .join(Base)
        .switch(Box)
        .join(Product)
        .join(ProductCategory)
        .where(
            (Base.organisation == organisation_id)
            & (date_filter)
            & (Location.visible == 1)
            & (Location.is_lost != 1)
            & (Location.is_scrap != 1)
        )
        .group_by(ProductCategory.name)
    )

    overview = []
    for box in boxes:
        overview.append(
            {
                "product_category_name": box.product.category.name,
                "number_of_boxes": box.number_of_boxes,
                "number_of_items": box.number_of_items,
            }
        )
    return overview
