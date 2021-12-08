from boxtribute_server.models.definitions.qr_code import QrCode


def test_qr_model(default_qr_code):
    id = QrCode.get_id_from_code(default_qr_code["code"])
    assert id == default_qr_code["id"]
