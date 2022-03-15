from datetime import datetime, time
from datetime import timezone as dtimezone

from dateutil import tz

from ..db import db
from ..enums import TransferAgreementState
from ..exceptions import (
    InvalidTransferAgreementBase,
    InvalidTransferAgreementOrganisation,
    InvalidTransferAgreementState,
)
from ..models.definitions.base import Base
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.definitions.transfer_agreement_detail import TransferAgreementDetail
from ..models.utils import utcnow


def _validate_bases_as_part_of_organisation(*, base_ids, organisation_id):
    """Raise InvalidTransferAgreementBase exception if any of the given bases is not run
    by the given organisation.
    """
    if base_ids != {None}:
        organisation_base_ids = [
            b.id
            for b in Base.select(Base.id).where(Base.organisation_id == organisation_id)
        ]
        invalid_base_ids = [i for i in base_ids if i not in organisation_base_ids]
        if invalid_base_ids:
            raise InvalidTransferAgreementBase(
                expected_base_ids=organisation_base_ids,
                base_id=invalid_base_ids[0],
            )


def create_transfer_agreement(
    *,
    target_organisation_id,
    type,
    source_base_ids=None,
    target_base_ids=None,
    valid_from=None,
    valid_until=None,
    timezone=None,
    user,
):
    """Insert information for a new TransferAgreement in the database. Update
    TransferAgreementDetail model with given source/target base information. By default,
    the agreement is established between all bases of both organisations (indicated by
    NULL for the Detail.source/target_base field). As a result, any base that added to
    an organisation in the future would be part of such an agreement.
    Convert optional local dates into UTC datetimes using timezone information.
    Raise an InvalidTransferAgreementOrganisation exception if the current user's
    organisation is identical to the target organisation.
    Raise an InvalidTransferAgreementBase expection if any specified source/target base
    is not part of the source/target organisation.
    """
    source_organisation_id = user.organisation_id
    if source_organisation_id == target_organisation_id:
        raise InvalidTransferAgreementOrganisation()

    with db.database.atomic():
        if valid_from is not None or valid_until is not None:
            tzinfo = tz.gettz(timezone)
            # Insert time information such that start/end is at midnight
            if valid_from is not None:
                valid_from = datetime.combine(
                    valid_from, time(), tzinfo=tzinfo
                ).astimezone(dtimezone.utc)
            if valid_until is not None:
                valid_until = datetime.combine(
                    valid_until, time(23, 59, 59), tzinfo=tzinfo
                ).astimezone(dtimezone.utc)

        transfer_agreement = TransferAgreement.create(
            source_organisation=source_organisation_id,
            target_organisation=target_organisation_id,
            type=type,
            valid_from=valid_from or utcnow(),
            valid_until=valid_until,
            requested_by=user.id,
        )

        # In GraphQL input, base IDs can be omitted, or explicitly be null.
        # Avoid duplicate base IDs by creating sets
        source_base_ids = set(source_base_ids or [None])
        target_base_ids = set(target_base_ids or [None])

        _validate_bases_as_part_of_organisation(
            base_ids=source_base_ids, organisation_id=source_organisation_id
        )
        _validate_bases_as_part_of_organisation(
            base_ids=target_base_ids, organisation_id=target_organisation_id
        )

        # Build all combinations of source and target organisation bases under current
        # agreement. The type of agreement is not taken into account (see
        # shipment._validate_bases_as_part_of_transfer_agreement)
        details_data = [
            {
                "source_base": s,
                "target_base": t,
                "transfer_agreement": transfer_agreement.id,
            }
            for s in source_base_ids
            for t in target_base_ids
        ]
        TransferAgreementDetail.insert_many(details_data).execute()
        return transfer_agreement


def accept_transfer_agreement(*, id, user):
    """Transition state of specified transfer agreement to 'Accepted'.
    Raise an InvalidTransferAgreementState exception if agreement state different from
    'UnderReview'.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Accepted
    agreement.accepted_by = user.id
    agreement.accepted_on = utcnow()
    agreement.save()
    return agreement


def reject_transfer_agreement(*, id, user):
    """Transition state of specified transfer agreement to 'Rejected'.
    Raise an InvalidTransferAgreementState exception if agreement state different from
    'UnderReview'.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Rejected
    agreement.terminated_by = user.id
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def cancel_transfer_agreement(*, id, user_id):
    """Transition state of specified transfer agreement to 'Canceled'.
    Raise error if agreement state different from 'UnderReview'/'Accepted'.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state not in [
        TransferAgreementState.UnderReview,
        TransferAgreementState.Accepted,
    ]:
        raise InvalidTransferAgreementState(
            expected_states=[
                TransferAgreementState.UnderReview,
                TransferAgreementState.Accepted,
            ],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Canceled
    agreement.terminated_by = user_id
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def retrieve_transfer_agreement_bases(*, transfer_agreement, kind):
    """Return all bases (kind: source or target) involved in the given transfer
    agreement. If the selection is None, it indicates that all bases of the respective
    organisation are included.
    """
    return Base.select().join(
        TransferAgreementDetail, on=getattr(TransferAgreementDetail, f"{kind}_base")
    ).where(
        TransferAgreementDetail.transfer_agreement == transfer_agreement.id
    ) or Base.select().where(
        Base.organisation == getattr(transfer_agreement, f"{kind}_organisation")
    )
