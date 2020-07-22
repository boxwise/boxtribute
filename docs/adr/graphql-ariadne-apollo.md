# ADR: GraphQL Data Layer

## Status

Accepted, installation of Ariadne and Apollo complete. Creation of GraphQL schema in progress.

## Context

Boxwise is in the middle of a planned migration from the old PHP-based Dropapp, to a new app based on a new stack (Python/React). In the old app, the backend and the data model were closely intertwined, with SQL strings written directly within PHP. This made it challenging to evolve the data model for the app, which in turn imposed many product functionality constraints and slowed development time - especially since the Dropapp data model was a prototype rather than designed for scalability and product-market fit. As the team migrates to the new app and explores the possibility of entering new markets, it is time for us to reexamine if and how the team might benefit from a separation of concerns on the data layer. 

## Decision drivers

1. **Scalability:** how well will it support expected future changes such as DB restructuring, database migrations, etc.? What timescale is the technology expected to be defunct on? 
2. **Developer experience:** given the rotating environment of loosely affiliated developers of different backgrounds, what will support the rapid onboarding of developers with our data structure? Once onboarded, is the chosen technology pleasant to use? Is it useful from a career progression standpoint? 
3. **Maintainability:** we expect to have rapid changes to the DB structure as we expand functionality. How easy is our solution to maintain and evolve? What about documentation?
4. **Support and production-readiness:** Is the library mature enough to use in a production environment? Is there an active community or support channel should we run into problems?

## Considered options

### API Styles

- **Full REST interface with backend.** Would involve the creation of multiple endpoints and resources that devs will have to request. Well-understood by professional devs, but new devs (coming from data analysis background, for example) would need to learn the correct REST standards. Has an over/underfetching problem, which causes it to be network traffic heavy. Difficult to evolve the API as you don't know what queries are requesting which fields from specific resources. Often leads to creating one endpoint per client.
- **No data layer / separation of concerns.** Would require all devs to be fluent in current table structure. All changes in the data model will need to be paired with cascading SQL query changes (or the equivalent in an ORM). 
- **Blended environment (GraphQL endpoint for inventory + REST endpoints for login).** Logic here was that it might be easier to create a REST endpoint for login and users, as proof of concept had already started with REST, and overfetching / underfetching is less of an issue with users. [Katie](https://github.com/orgs/boxwise/people/mcgnly) said she preferred to build everything in one style. Accepted this point as she will be implementing login. 
- **GraphQL with single endpoint for everything.** *Benefits* - avoids underfetching/overfetching problem, very readable on the front-end, query language is super easy compared to learning SQL from scratch. Enables parameterized queries, and inherently supports incremental evolution as fields are explicitly specified in each query. Supported by Facebook and is being adopted by major tech companies such as Paypal, Github, eBay etc. *Cons* - new kid on the block, most devs are much less familiar with GraphQL as a concept. Requires devs to understand the concepts of queries, mutations, resolvers. [N+1 problem](https://engineering.shopify.com/blogs/engineering/solving-the-n-1-problem-for-graphql-through-batching#:~:text=The%20n%2B1%20problem%20means,the%20address%20for%20N%20authors). Less easy to cache than REST.

### Server

- **[Graphene](https://github.com/graphql-python/graphene):** Takes a code first approach. Development is [reportedly lagging behind](https://www.reddit.com/r/django/comments/egkpd5/graphenedjango_vs_ariadne/) with maintainers looking for people to take over. Oldest Python solution around, so likely quite stable. Many frustrated users on reddit.
- **[Ariadne](https://github.com/mirumee/ariadne):** Takes a schema-first approach. [Excellent documentation](https://ariadnegraphql.org/docs/intro), with functionality designed to mimic industry leader [Apollo Server](https://www.apollographql.com/docs/apollo-server/), which uses node.js and is not compatible with a Python back-end. Fewer stars compared to Graphene; however, compensates for this somewhat through their [Spectrum support channel](https://spectrum.chat/ariadne?tab=posts). Well-loved on reddit, but on 0.11 release. Supported by a small dev shop, Mirumee Software.

### Client
- **[Apollo Client](https://www.apollographql.com/docs/react/):** Well-supported industry leader. Extensive documentation, sophisticated caching solution. Large footprint. Previously considered hard to set up and configure due to sophistication, but now has [Apollo Boost](https://www.npmjs.com/package/apollo-boost) package to make things super simple and speedy.
- **[urql](https://github.com/FormidableLabs/urql):** A lightweight tiny client solution intended to make graphQL simple. However, it lacks one of the major benefits of the Apollo client, which is cacheing. Supported by a medium-size dev shop. Younger than Apollo Client as well as all of the server options.


## Decision
GraphQL with single endpoint for everything was selected, paired with Ariadne server-side and Apollo client side. 

Reasoning: while GraphQL may have a steeper learning curve for professional developers who are not familiar with the standard, in the long run this should be more scalable for iterations and easier to maintain than  multiple REST endpoints. In the future, should we end up ingesting external data APIs such as the UNHCR data, it will be easier to pull that all from the GraphQL endpoint as well. This should also be more favorable from a developer experience standpoint for both onboarding and maintaining the codebase, due to GraphQL's introspective capabilities, human-readable JSON query structure, and degree of client-side specificity in requesting field-level data. 

Apollo was selected on the client-side due to its maturity as a product, robust features including sophisticated caching, excellent documentation, and huge community. Ariadne was selected over Graphene on the server side due to it being designed to deliberately intended to mimic Apollo Server. With Ariadne being under active development by Mirumee software, and its excellent documentation that developers can cross-reference with Apollo server documentation, I believe this outweighs any cons that come from it being a less mature library than Graphene.

Finally, I believe any performance concerns that could result from queries being abstracted from SQL into resolvers will be compensated for by less load on the network due to overfetching, as long as no N+1 queries are created. 

## Consequences

### Easier
- requesting data from the backend, once initial set up is complete
- integrating external data sources
- readability of queries
- making changes to the database without breaking every single existing query
- data structures (understanding and keeping track of the data structure and their relationships with one another)
- versioning


### More difficult
- Initial set up means that we cannot take advantage of Flask utilities to create REST endpoints for things like login and routing
- Initial set up of data schema
- Optimizing for query performance
- Error handling (GraphQL does not inherently use HTTP response codes like REST)
- potentially optimizing scalability and performance within a large scale distributed system

### Further Reading
https://goodapi.co/blog/rest-vs-graphql

