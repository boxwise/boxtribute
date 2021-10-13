import pytest
from boxwise_flask.exceptions import RequestedResourceNotFound
from boxwise_flask.models.crud import create_qr_code
from boxwise_flask.models.qr_code import QRCode


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QRCode.select())

    with pytest.raises(RequestedResourceNotFound):
        create_qr_code({"box_label_identifier": "zzz"})

    # The nr of rows in the QRCode table should be unchanged
    assert nr_qr_codes == len(QRCode.select())
