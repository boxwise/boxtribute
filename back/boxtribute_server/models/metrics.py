"""Computation of various metrics"""
from datetime import date

from peewee import JOIN, fn

from .definitions.base import Base
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.location import Location
from .definitions.transaction import Transaction


def compute_number_of_families_served(*, organisation_id, after):
    after = after or date.today()
    return (
        Beneficiary.select()
        .join(Base)
        .where(
            (Base.organisation == organisation_id)
            & (
                Beneficiary.id
                << (
                    Beneficiary.select()
                    .join(Transaction, JOIN.LEFT_OUTER)
                    .where((Transaction.created_on > after) & (Transaction.count > 0))
                ).distinct()
            )
        )
        .count()
    )


def compute_number_of_sales(*, organisation_id, after):
    after = after or date.today()
    return (
        Transaction.select(fn.sum(Transaction.count))
        .join(Beneficiary)
        .join(Base)
        .where(
            (Transaction.created_on > after) & (Base.organisation == organisation_id)
        )
        .scalar()  # returns None if no Transactions selected
        or 0
    )


def compute_stock_overview(*, organisation_id):
    overview = (
        Box.select(
            fn.sum(Box.items).alias("number_of_items"),
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
