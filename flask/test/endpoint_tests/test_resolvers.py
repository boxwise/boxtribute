"""Unit tests for resolver functions. Eventually should be turned into GraphQL API
tests.
"""
from boxwise_flask.graph_ql.resolvers import resolve_beneficiaries

from flask import g


def test_resolve_beneficiaries_limit(client):
    # client fixture required for app test context. Patch current user
    g.user = {"base_ids": [1], "permissions": ["beneficiary:read"]}

    beneficiaries = resolve_beneficiaries(None, None, dict(cursor=None, limit=1))
    assert len(beneficiaries) == 1

    beneficiaries = resolve_beneficiaries(None, None)
    assert len(beneficiaries) == 2
