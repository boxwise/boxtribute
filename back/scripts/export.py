"""Utility to export organisation data from the Boxtribute query-only API to CSV.

Populate the .env file with the environment variables BOXTRIBUTE_API_USERNAME and
BOXTRIBUTE_API_PASSWORD, and run the script like

    python back/scripts/export.py ...

Example:
- export data of all active beneficiaries in base ID 42

    python back/scripts/export.py beneficiary -b 42
"""
import argparse
import csv
import json
import os
import time
import urllib.request

from dotenv import load_dotenv

URL = "https://api.boxtribute.org"
load_dotenv()


def post(*, url, parameters, access_token=None):
    """Issue a POST request to given url, passing parameters as JSON.
    Return response JSON.
    """
    headers = {"Content-Type": "application/json"}
    if access_token is not None:
        headers["Authorization"] = f"Bearer {access_token}"
    data = json.dumps(parameters).encode("utf-8")
    request = urllib.request.Request(url, data, headers)
    with urllib.request.urlopen(request) as f:
        return json.loads(f.read().decode())


def fetch_access_token():
    response = post(
        url=f"{URL}/token",
        parameters={
            "username": os.environ["BOXTRIBUTE_API_USERNAME"],
            "password": os.environ["BOXTRIBUTE_API_PASSWORD"],
        },
    )
    return response["access_token"]


def fetch_data(*, kind, base_id, access_token):
    if kind == "beneficiary":
        query = f"""query {{ base(id: {base_id}) {{
                beneficiaries (
                    filterInput: {{ active: true }}
                ) {{ totalCount }} }} }}"""
        response = post(url=URL, parameters={"query": query}, access_token=access_token)
        total_count = response["data"]["base"]["beneficiaries"]["totalCount"]

        query = f"""query {{ base(id: {base_id}) {{
                beneficiaries (
                    paginationInput: {{ first: {total_count} }},
                    filterInput: {{ active: true }}
                ) {{
                    elements {{
                        firstName
                        lastName
                        dateOfBirth
                        age
                        comment
                        groupIdentifier
                        gender
                        familyHead {{ id }}
                        isVolunteer
                        registered
                        tokens
                    }} }} }} }}"""
        response = post(url=URL, parameters={"query": query}, access_token=access_token)
        return response["data"]["base"]["beneficiaries"]["elements"]
    return {}


def sanitize_data(*, data, kind):
    for row in data:
        # replace any newline chars because they result in broken CSV files
        row["comment"] = row["comment"].replace("\r\n", " ")
    return data


def write_to_csv(*, data, kind, filepath=None):
    filepath = filepath or f"{kind}-{int(time.time())}.csv"
    with open(filepath, "w", newline="") as csvfile:
        fieldnames = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "age",
            "comment",
            "groupIdentifier",
            "gender",
            "familyHead",
            "isVolunteer",
            "registered",
            "tokens",
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


def main(*, data_kind, base_id, export_filepath):
    access_token = fetch_access_token()
    data = fetch_data(kind=data_kind, base_id=base_id, access_token=access_token)
    data = sanitize_data(data=data, kind=data_kind)
    write_to_csv(data=data, kind=data_kind, filepath=export_filepath)


def parse_cli():
    parser = argparse.ArgumentParser(
        description=globals()["__doc__"],
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("data_kind", choices=["beneficiary"])
    parser.add_argument("-b", "--base-id", type=int)
    parser.add_argument(
        "-f",
        "--export-filepath",
        help="Default: time-stamped file in current working directory",
    )

    return parser.parse_args()


if __name__ == "__main__":
    options = parse_cli()
    main(**vars(options))
