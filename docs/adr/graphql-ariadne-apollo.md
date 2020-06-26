# ADR: GraphQL Data Layer

## Status

Accepted, installation of Ariadne and Apollo complete. Creation of schema in progress.

## Context

TBD

## Decision drives

1. Scalability: how well will it support expected future changes such as DB restructuring, database migrations, etc.? What timescale is the technology expected to be defunct on? 
2. Developer experience: given the rotating environment of loosely affiliated developers of different backgrounds, what will support the rapid onboarding of developers with our data structure? Once onboarded, is the chosen technology pleasant to use? Is it useful from a career progression standpoint? 
3. Maintainability: we expect to have rapid changes to the DB structure as we expand functionality. How easy is our solution to maintain and evolve? What about documentation?
4. Support and production-readiness: Is the library mature enough to use in a production-ready environment? Is there an active community or support channel should we run into problems?

## Considered options

### API Styles

- Full REST interface with backend. Will involve the creation of multiple endpoints and resources that devs will have to request. Well-understood by professional devs, but new devs (coming from data analysis background, for example) would need to learn the correct REST standards. Has an over/underfetching problem, which causes it to be network traffic heavy. Difficult to evolve the API as you don't know what queries are requesting which fields from specific resources. Often leads to creating one endpoint per client.
- No data layer / separation of concerns. Would require all devs to be fluent in current table structure. All changes in data will need to be paired with a SQL query (or the equivalent in an ORM). 
- Blended environment (GraphQL endpoint for inventory + REST endpoints for login). Logic here was that it might be easier to create a REST endpoint for login and users, as proof of concept had already started with REST, and overfetching / underfetching is less of an issue with users. [Katie](https://github.com/orgs/boxwise/people/mcgnly) said she preferred to build everything in one style as for her it would be easier. Accepted this point as she will be implementing login. 
- GraphQL with single endpoint for everything. Benefits - avoids underfetching/overfetching problem, very readable on the front-end, query language is super easy compared to learning fresh SQL. Enables parameterized queries, and inherently supports incremental evolution as fields are explicitly specified in each query. Supported by Facebook and is being adopted by major tech companies such as Paypal, Github, eBay etc. Cons - new kid on the block, most devs are much less familiar with GraphQL as a concept. Requires devs to understand the concepts of queries, mutations, resolvers. [N+1 problem](https://engineering.shopify.com/blogs/engineering/solving-the-n-1-problem-for-graphql-through-batching#:~:text=The%20n%2B1%20problem%20means,the%20address%20for%20N%20authors). Less easy to cache than REST.

### Server

- [Graphene](https://github.com/graphql-python/graphene): Takes a code first approach. Development is [reportedly lagging behind](https://www.reddit.com/r/django/comments/egkpd5/graphenedjango_vs_ariadne/) with maintainers looking for people to take over. Oldest Python solution around, so likely quite stable. Many frustrated users on reddit.
- [Ariadne](https://github.com/mirumee/ariadne): Takes a schema-first approach. [Excellent documentation](https://ariadnegraphql.org/docs/intro), with functionality designed to mimic industry leader Apollo server. Fewer stars compared to Graphene; however, compensates for this somewhat through their [Spectrum support channel](https://spectrum.chat/ariadne?tab=posts). Well-loved on reddit, but on 0.11 release. Supported by a small dev shop, Mirumee Software.


### Client
- [Apollo Client](https://www.apollographql.com/docs/react/): Well-supported industry leader. Extensive documentation, sophisticated caching solution. Large footprint. Previously considered hard to set up and configure due to sophistication, but now has Apollo Boost package to make things super simple and speedy.
- [urql](https://github.com/FormidableLabs/urql): A lightweight tiny server solution intended to make graphQL simple. However, it lacks one of the major benefits of the Apollo client, which is cacheing. Supported by a medium-size dev shop. Younger than Apollo Client and all of the server options.


## Decision


## Consequences

### Easier


### More difficult
