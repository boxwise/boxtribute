from ...exceptions import _InvalidResourceState


class NotEnoughItemsInBox(Exception):
    def __init__(
        self,
        *args,
        box_label_identifier,
        number_of_actual_items,
        number_of_requested_items,
        **kwargs,
    ):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": "There are not enough items (actual: "
            f"{number_of_actual_items}; requested: {number_of_requested_items}) "
            f"in the box {box_label_identifier}.) ",
        }
        super().__init__(*args, **kwargs)


class InvalidDistributionEventState(_InvalidResourceState):
    def __init__(self, *args, expected_states, actual_state, **kwargs):
        super().__init__(
            "distribution_event",
            *args,
            expected_states=expected_states,
            actual_state=actual_state,
            **kwargs,
        )


class DistributionEventAlreadyInTrackingGroup(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "The distribution event is already part of a tracking group.",
    }


class ModifyCompletedDistributionEvent(Exception):
    def __init__(
        self,
        *args,
        distribution_event_id,
        desired_operation,
        **kwargs,
    ):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"Cannot operate '{desired_operation}' on "
            "the distribution event (id={distribution_event_id}). "
            "It has already been completed. ",
        }
        super().__init__(*args, **kwargs)
