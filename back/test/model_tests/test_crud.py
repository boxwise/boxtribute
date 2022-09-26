import peewee
import pytest
from boxtribute_server.models.crud import create_qr_code
from boxtribute_server.models.definitions.qr_code import QrCode


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QrCode.select())

    with pytest.raises(
        peewee.DoesNotExist, match="<Model: Box> instance matching query does not exist"
    ):
        create_qr_code(box_label_identifier="zzz")

    # The nr of rows in the QrCode table should be unchanged
    assert nr_qr_codes == len(QrCode.select())
