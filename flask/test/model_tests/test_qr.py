from boxwise_flask.models.qr_code import QRCode


def test_qr_model(default_qr_code):
    id = QRCode.get_id_from_code(default_qr_code["code"])
    assert id == default_qr_code["id"]
