import pytest
from boxtribute_server.app import create_app
from boxtribute_server.models import MODELS
from boxtribute_server.routes import app_bp


@pytest.fixture
def no_db_client():
    app = create_app()
    app.register_blueprint(app_bp)
    # Reset possible interference from other (endpoint/integration) tests
    for model in MODELS:
        model.bind(None)
    with app.app_context():
        yield app.test_client()
