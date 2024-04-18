import subprocess

from boxtribute_server.blueprints import CRON_PATH


def test_cron_job_endpoint(read_only_client, mocker, monkeypatch):
    monkeypatch.setenv("MYSQL_USER", "root")
    monkeypatch.setenv("MYSQL_PASSWORD", "pass")
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    monkeypatch.setenv("MYSQL_SOCKET", "/some/socket")
    reseed_db_path = f"{CRON_PATH}/reseed-db"

    # Permission denied due to missing header
    response = read_only_client.get(reseed_db_path)
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Permission denied due to wrong value in header
    response = read_only_client.get(
        reseed_db_path, headers=[("X-AppEngine-Cron", "false")]
    )
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    headers = [("X-AppEngine-Cron", "true")]
    # Bad request due to unknown subpath
    response = read_only_client.get(f"{CRON_PATH}/unknown-job", headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "unknown job 'unknown-job'"}

    # Success because patched command exits with 0
    mocker.patch("subprocess.run").return_value = subprocess.CompletedProcess(
        returncode=0, args=[]
    )
    response = read_only_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}

    # Server error because patched command exits with 1
    process = subprocess.CompletedProcess(returncode=1, args=[])
    process.stderr = b"Error"
    mocker.patch("subprocess.run").return_value = process
    response = read_only_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 500
    assert response.json == {"message": "Error"}

    # Bad request due to wrong environment
    monkeypatch.setenv("MYSQL_DB", "dropapp_production")
    response = read_only_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "Reset of 'dropapp_production' not permitted"}
