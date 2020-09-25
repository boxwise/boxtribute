from boxwise_flask.models.qr import Qr


def test_qr_model():
    qr_code = {"id": 1, "code": "999"}

    Qr.create(**qr_code)
    id = Qr.get_id_from_code(qr_code["code"])
    assert id == qr_code["id"]
