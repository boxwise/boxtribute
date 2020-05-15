from ariadne import ObjectType, make_executable_schema, snake_case_fallback_resolvers
from ariadne.constants import PLAYGROUND_HTML
from flask import Flask, request, jsonify
from .type_defs import type_defs


query = ObjectType("Query")

#registers this fn as a resolver for the "hello" field, can use it as the resolver for more than one thing by just adding more decorators
@query.field("hello") 
def resolve_hello(_, info): # discard the first input because it belongs to a root type (Query, Mutation, Subscription). Otherwise it would be a value returned by a parent resolver.
    request = info.context
    user_agent = request.headers.get("User-Agent", "Guest")
    return ("Hello, {}!".format(user_agent))

schema = make_executable_schema(type_defs, query,snake_case_fallback_resolvers)






# class Resolver:
#     def __init__(self):


    # def __str__(self):
    #     return "resolvers for hello world"