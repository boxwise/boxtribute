from ariadne import gql

type_defs = gql("""
    type Query {
        hello: String!
    }
""")
