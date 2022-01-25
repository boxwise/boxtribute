from ..models.definitions.beneficiary import Beneficiary


def derive_beneficiary_filter(filter_input):
    """Derive filter condition for select-query from given filter parameters. If no
    parameters given, return True (i.e. no filtering applied).
    """
    if not filter_input:
        return True

    condition = True
    created_from = filter_input.get("created_from")
    if created_from is not None:
        condition &= Beneficiary.created_on >= created_from

    created_until = filter_input.get("created_until")
    if created_until is not None:
        condition &= Beneficiary.created_on <= created_until

    active = filter_input.get("active")
    if active is not None:
        # By default, the 'deleted' DateTimeField is '0000-00-00 00:00:00' which
        # evaluates to both NULL and NOT NULL. Hence in order to find actual dates
        # (indicating inactive beneficiaries) use >0 instead of IS NOT NULL
        condition &= (
            Beneficiary.deleted.is_null() if active else Beneficiary.deleted > 0
        )

    is_volunteer = filter_input.get("is_volunteer")
    if is_volunteer is not None:
        condition &= (
            Beneficiary.is_volunteer if is_volunteer else ~Beneficiary.is_volunteer
        )

    is_registered = filter_input.get("is_registered")
    if is_registered is not None:
        condition &= (
            ~Beneficiary.not_registered if is_registered else Beneficiary.not_registered
        )

    pattern = filter_input.get("pattern")
    if pattern is not None:
        condition &= (
            (Beneficiary.last_name.contains(pattern))
            | (Beneficiary.first_name.contains(pattern))
            | (Beneficiary.comment.contains(pattern))
            | (Beneficiary.group_identifier == pattern)
        )
    return condition
