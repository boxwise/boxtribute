from boxwise_flask.models.qr_code import QRCode


def test_qr_model():
    qr_code = {"id": 1, "code": "999"}

    QRCode.create(**qr_code)
    id = QRCode.get_id_from_code(qr_code["code"])
    assert id == qr_code["id"]
