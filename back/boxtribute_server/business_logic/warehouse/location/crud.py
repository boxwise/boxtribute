from ....enums import BoxState
from ....models.definitions.location import Location
from ....models.utils import (
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
    utcnow,
)


@save_creation_to_history
def create_location(
    *,
    name,
    base_id,
    box_state=BoxState.InStock,
    is_shop=False,
    is_stockroom=False,
    description="",
    user_id,
):
    """Insert information for a new Location in the database."""
    now = utcnow()
    return Location.create(
        name=name,
        base=base_id,
        box_state=box_state,
        description=description,
        is_stockroom=is_stockroom,
        is_shop=is_shop,
        is_donated=box_state == BoxState.Donated,
        is_lost=box_state == BoxState.Lost,
        is_scrap=box_state == BoxState.Scrap,
        created_on=now,
        created_by=user_id,
    )


@save_update_to_history(
    fields=[
        Location.name,
        Location.description,
        Location.box_state,
        Location.is_stockroom,
        Location.is_shop,
        Location.is_donated,
        Location.is_lost,
        Location.is_scrap,
    ],
)
def update_location(
    *,
    id,  # required for save_update_to_history
    # location,
    name=None,
    description=None,
    box_state=None,
    is_stockroom=None,
    is_shop=None,
    user_id,
):
    """Look up an existing Location given an ID, and update all requested fields.
    Insert timestamp for modification and return the location.
    """
    location = Location.get_by_id(id)

    if name is not None:
        location.name = name
    if description is not None:
        location.description = description
    if box_state is not None:
        location.box_state = box_state
        location.is_donated = box_state == BoxState.Donated
        location.is_lost = box_state == BoxState.Lost
        location.is_scrap = box_state == BoxState.Scrap
    if is_stockroom is not None:
        location.is_stockroom = is_stockroom
    if is_shop is not None:
        location.is_shop = is_shop

    return location


@safely_handle_deletion
def delete_location(*, user_id, location):
    """Soft-delete given location. Return the soft-deleted location."""
    location.visible = False
    return location
