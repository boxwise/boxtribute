import pytest
from boxtribute_server.business_logic.box_transfer.shipment.fields import (
    first_letters_of_base_name,
)


@pytest.mark.parametrize("base_id,result", [[1, "TH"], [2, "AS"], [3, "WÜ"]])
def test_first_letters_of_base_name(base_id, result):
    assert first_letters_of_base_name(base_id) == result
