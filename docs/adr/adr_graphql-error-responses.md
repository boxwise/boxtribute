# ADR: GraphQL error response structure

[Trello card](https://trello.com/c/2fJoBEf8/1380-20-assort-adr-on-graphql-error-responses)

Decision Deadline: 2024-03-15

Author: @pylipp

## Status

~Proposed.~

2024-03-07 Accepted.

2024-04-11 Updated (option C).

## Context or Problem Statement

The boxtribute web app uses GraphQL to define the interface between front-end and back-end. Reasons for using GraphQL and specific frameworks can be found elsewhere [1]. According to the requests of the front-end, both data and errors will be transferred via the GraphQL interface (in the `data` and `errors` response fields). Especially in the case of errors it's important to provide clear information about why and where an error occurred, during time of development as well as during runtime of the app.

Currently the back-end follows a strategy similar to the one of Apollo Server [2]: custom exceptions with an `extensions` attribute (containing at least an alphabetical error code and a description; however arbitrarily extending it is possible) are raised in case of an error [3]. When processing a response, the front-end acts depending on the error code (defining it's own result types) [4] but will use the description text as further conditions if necessary [5].

While this approach is more convenient than the default GraphQL error response structure, and mentioned in the ariadne community [6], it is brittle: error code strings might be changed or miss-spelled in the back-end's exception definition, same goes for description texts. In the past it showed that complex bulk operations, like the mutation to receive boxes for a shipment, have to handle various errors but don't define dedicated structures to indicate these [7]. Instead errors might be ignored, leading to confusing states in the front-end, and bugs, [8].

## Decision Drivers

1. **Clarity**
1. **App reliability**
1. **Impact on development**

## Considered Options

A. Keep the current state (use string codes defined in the back-end to distinguish errors)

B. Use union types defined in the GraphQL schema to indicate error results

C. Use custom result type encapsulating both data and errors (set mutually exclusive)

### Details on option B

This approach is taken from [9]. I recommend to read the blog post but I also highlight the ideas.

For any operation, the possible results are considered and directly woven into the GraphQL schema.

Let's look at the issues of the approach of putting errors into the `errors` response field, like the boxtribute back-end does:

1. All errors are treated the same, no matter what kind
1. It’s hard to know where the error came from (esp. for complex operations)
1. It’s hard for the client to know what errors to care about

**Proposed approach**: think of possible results of an operation, and model them using union types. E.g. when fetching a user by their username, it might turn out they do not exist, are blocked, or unavailable.

<details>
  <summary>Example schema and query</summary>

```graphql
type User {
  id: ID!
  name: String
}

type DoesNotExist

type IsBlocked {
  message: String
  blockedByUser: User
}

type UnavailableInCountry {
  countryCode: Int
  message: String
}

union UserResult = User | IsBlocked | UnavailableInCountry | DoesNotExist

query {
    user(username: String!): UserResult!
}
```

Example query...

```graphql
{
  user(username: "@ash") {
    __typename
    ... on User {
      id
      name
    }
    ... on DoesNotExist { }
    ... on IsBlocked {
      message
      blockedByUser {
        name
      }
    }
    ... on UnavailableInCountry {
      countryCode
      message
    }
}
```

...and success response

```graphql
{
  "data": {
    "userResult": {
      "__typename": "User",
      "id": "268314bb7e7e",
      "name": "Ash Ketchum"
    }
  }
}
```

...or error response

```graphql
{
  "data": {
    "userResult": {
      "__typename": "IsBlocked",
      "message": "User blocked: @ash",
        "blockedByUser": {
          "username": "@brock"
        }
     }
  }
}
```

</details>

The advantages are:

1. Results are customizable for each entity (a User will have different Results than other types, for example Tweet, will)
1. We know where the error came from. We our error comes from in the query (because it’s attached to the entity); it’s actually encoded in the schema
1. The client decides what errors it cares about and what errors it can ignore. The client can query or not query for different Results, so it decides what’s important.

### Details on option C

This approach is taken from the ariadne documentation [10], with adaptions from a discussion here [11].

Again, it's discouraged to use the main `errors` field to convey errors since messages present under this key are technical in nature and shouldn't be displayed to end users. Instead, one should define custom result types including fields for data (in case of success) and errors (in case of failures) which are set mutually exclusive.

```graphql
type Query {
  user(id: ID!): UserResult!
}

type Mutation {
  createUser(input: createUserInput!): UserResult!
}

type UserResult {
  user: User
  # e.g. non-existing user, invalid input (user name, user organisation), missing permissions, ...
  # Arguably these could be custom error types like with option B
  errors: [String!]
}
```

Depending on success or failure, the mutation resolver may return either error messages to be displayed to the user, or the newly created user. The API result-handling logic may then interpret the response based on the content of those two keys, only falling back to the main `errors` key to make sure there wasn't an error in query syntax, connection or application.

Likewise, the Query resolvers may return None instead of requested object, which client developers may interpret as a signal from API to display a "Requested item doesn't exist" message to the user in place of the requested resource.

This option allows to return multiple errors back to the client instead of a single error.

In the actual resolver implementation the BE will have to be able to collect all errors or the success result like

```python
def resolve_create_user(*_, input):
    errors = []
    if not authorize():
        errors.append("Not authorized")

    validation_errors = validate(input)
    if validation_errors:
        errors.extend(validation_errors)

    if errors:
        return {"user": None, "errors": errors}

    user = db.create_user(input)
    return {"user": user, "errors": None}
```

## Decision

Use option B. Apply it for any new addition to the GraphQL schema. Existing operations are not updated (only refactor them when they would be changed anyways).

1. **Clarity** Possible errors of operations are immediately obvious from the GraphQL schema
1. **App reliability** Since we don't have integration tests, currently an incautious change of error code or description in the back-end, or a spelling error in the front-end error response handling might go undetected through automated testing and end up in production.
1. **Impact on development** Front-end devs don't have to look into back-end business logic code to find the type of errors possibly returned by an operation. They don't have to define additional result types, either. However query bodies will be more verbose due to the handling of union types (see example above).
1. **Resolver verbosity** With option C, resolvers have to return lengthy results with one of the two fields set to None anyways. There's no real advantage in returning multiple errors anyways since it does not occur frequently but would then potentially overwhelm the end user.

## Consequences

- (+) improved, less error-prone GraphQL interface
- (-) mixed error response style in the schema and in the front-end/back-end code bases

## References

- [1] [GraphQL framework ADR](./adr_graphql-ariadne-apollo.md)
- [2] https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes
- [3] https://github.com/boxwise/boxtribute/blob/666f57331c06dea0da1488c6bd9c7101b54d3822/back/boxtribute_server/exceptions.py#L57-L61
- [4] https://github.com/boxwise/boxtribute/blob/666f57331c06dea0da1488c6bd9c7101b54d3822/front/src/hooks/useQrResolver.ts#L56-L81
- [5] https://github.com/boxwise/boxtribute/blob/666f57331c06dea0da1488c6bd9c7101b54d3822/front/src/views/Transfers/CreateTransferAgreement/CreateTransferAgreementView.tsx#L217-L218
- [6] https://github.com/mirumee/ariadne/issues/339#issuecomment-604380881
- [7] https://github.com/boxwise/boxtribute/blob/666f57331c06dea0da1488c6bd9c7101b54d3822/back/boxtribute_server/business_logic/box_transfer/shipment/crud.py#L500
- [8] https://trello.com/c/rBlCIgkx/1331-20-bug-when-a-multi-base-user-goes-to-a-shipment-from-another-base-he-she-cannot-reconcile-it-but-he-she-gets-a-success-message
- [9] https://sachee.medium.com/200-ok-error-handling-in-graphql-7ec869aec9bc
- [10] https://ariadnegraphql.org/docs/0.22/error-messaging
- [11] https://github.com/mirumee/ariadne/discussions/579
