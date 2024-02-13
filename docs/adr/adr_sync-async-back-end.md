# ADR: Sync/Async architecture of the back-end

Decision Deadline: not pressing

Discussion Participants: @pylipp, @jamescrowly, @haguesto, @aerinsol

## Status

In progress.

## Context or Problem Statement

Python code is naturally executed sequentially by the interpreter. However Python 3 started to support asynchronous execution ("async" for short) from about 2015 onwards. This means that execution of code that would otherwise block program execution (because it has to wait for a network response or similar) is transferred to an execution loop, while the main code continues to run. Possible results from the execution loop will be awaited and resolved when available.

In more detail, the boxtribute back-end stack looks like this:
* the BE is a Flask app with a single endpoint that the FE sends GraphQL requests to
* the requests are processed by `ariadne` in an [async execution loop](https://github.com/boxwise/boxtribute/blob/3806009c131a270e9ccd9ecf1421e4cfd39ff2d8/back/boxtribute_server/graph_ql/execution.py#L66) (required by the `aiodataloader` package which supports with batch-loading. In turn, batch-loading is necessary to reduce database calls for GraphQL requests with nested fields)
* in GraphQL resolver functions, the sync ORM `peewee` is used to run CRUD operations on the MySQL DB
* in Google App Engine, the Flask app is invoked by the WSGI server `gunicorn`

**ISSUE** The codebase mixes async code at GraphQL level and sync code at DB level. In detail, [async batch-loading code calls sync ORM functions](https://github.com/boxwise/boxtribute/blob/3806009c131a270e9ccd9ecf1421e4cfd39ff2d8/back/boxtribute_server/graph_ql/loaders.py#L190) which results in [blocking the entire event loop (section "Sync from Async")](https://www.aeracode.org/2018/02/19/python-async-simplified/). I could indeed observe during profiling that processing a complex GraphQL request (for fetching the boxes on the ManageBoxes page) slows down during the batch-loading phase

## Considered Options

A. Keep current mixed state

B. Fully sync back-end

C. Fully async back-end

## Decision Drivers

1. **Maintainability and simplicity**: What's the team's experience? How straightforward is debugging of the stack?
1. **Stable ecosystem**: how mature do we assess the Python async ecosystem? How stable and well-maintained are core packages?
1. **Software performance**: how much does either of the options slow down or speed up code execution?
1. **Software consistency**: how important is it to get away from the current mixed state?
1. **Initial development cost**: how expensive is a possible migration to fully sync or fully async?
1. **Async use cases**: what is the estimated extent of I/O blocking code in the back-end (e.g. network calls to external APIs like Auth0)? Since async is a prerequisite for using ariadne subscriptions, how likely is it to integrate this functionality in the future?

### Experience reports

From the [ariadne GitHub forum](https://github.com/mirumee/ariadne/discussions/1149):
- hypercorn + starlette, aiodataloader without ORM
- starlette/FastAPI/Mangum, aiodataloader, ORM: encode-databases or SQLAlchemy 2

From James' CTO friends:
- to do

## Consequences

What becomes easier or more difficult to do because of this change?

**A. Keep current mixed state**
- (+) no risk of switching to unfamiliar packages
- (+) should be feasible to implement subscriptions
- (o) maybe possible to use `gevent` for improved performance (recommended by [peewee author](https://docs.peewee-orm.com/en/latest/peewee/database.html#async-with-gevent))
- (o) the original issue stated above persists unless it can be circumvented with `asyncio.to_thread` or similar

**B. Fully sync back-end**
- (+) no risk of switching to unfamiliar packages and programming concepts
- (o) use a [sync batch-loading package](https://github.com/jkimbo/graphql-sync-dataloaders) (rather unpopular but recommended by ariadne in their docs)
- (o) must find work-arounds to call external APIs (e.g. threading)
- (-) uncertainty of using subscriptions

**C. Fully async back-end**
- (+) subscriptions are supported
- (+) calls to external APIs are non-blocking
- (o) little team experience with development of async Python
- (-) risk and expense of replacing web-framework (Flask) and ORM (peewee) with async counterparts

## Further reading

* [peewee author's criticizing asyncio](https://charlesleifer.com/blog/asyncio/)
* [blog post about what effect using sync/async has on codebases](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)
* [blog post about relationship of async Python code and databases](https://techspot.zzzeek.org/2015/02/15/asynchronous-python-and-databases/)
* [Tutorial and analysis of using Flask and gevent](https://iximiuz.com/en/posts/flask-gevent-tutorial/)
* [blog post with real-world asyncio Python example](https://www.roguelynn.com/words/asyncio-we-did-it-wrong/)
* [older article about calling sync code from async code](https://bbc.github.io/cloudfit-public-docs/asyncio/asyncio-part-5.html)
* [reddit thread about using async in Flask](https://www.reddit.com/r/flask/comments/xvw1vi/misunderstandings_about_how_async_works_with/)

## Decision

Pending.
