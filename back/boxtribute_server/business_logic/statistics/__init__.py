from ariadne import QueryType

# Defined in separate module to circumvent circular import of db module
query = QueryType()


def statistics_queries():
    """Return names of all resolvers registered on the QueryType at runtime."""
    return list(query._resolvers.keys())
