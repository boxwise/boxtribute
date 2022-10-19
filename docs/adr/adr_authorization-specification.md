# ADR: Python Development Environment

Trello card:

Decision deadline: irrelevant since implementation pending

Author: [Philipp](https://github.com/orgs/boxwise/people/pylipp)

## Status

Implementation on-going.

## Context

The `boxtribute` application is used by various organisations to manage distribution of aid goods. Some data stored contains personal, confidential information and must not be exposed to unintended parties. Implementation of authorization measures is required to define and enforce data excess depending on the current application user.

The current document serves as a summary of decisions about user authorization in the boxtribute application.

## Decision drives

1. Security: exposure of confidential data must be prohibited
1. Clarity: make the governing structures easy to understand for stakeholders (users, product management, developers)
1. Single source of trust: data for controlling authorization must not be distributed
1. Simplicity during development: enforcing authorization should be straightforward for developers while guaranteeing security
1. Maintainability: management of roles and permissions should have little overhead and be extensible
1. Integration in both dropapp and boxtribute 2.0

## Authorization in boxtribute

### Fundamental concepts

#### Organisation and base

- briefly explain the structure

#### Usergroups

- list of existing usergroups and what roles they reflect in the partner organisations
    - Head of operations
    - Coordinator
    - Volunteer
    - God user

#### Permissions

- action-based permissions (ABP)
- resource-based permissions (RBP)
- connection between usergroup and ABP
- connection between ABP and RBP

### User management in Auth0

#### What is Auth0

Cf. [related ADR](./docs/adr/adr_auth0.md)

#### User entity in Auth0

- list user attributes stored in Auth0
- explain how users are managed
- explain assignment of permissions via action script

#### Specification of custom JWT

- explain usage of asymmetric encryption (public and private key)
- explain structure (claims email, organisation_id, base_ids, roles, permissions)

### Implementation of authorization

#### Dropapp

#### boxtribute 2.0 front-end

#### boxtribute 2.0 back-end

When a user issues a request to the back-end, their authorization information needs to be pulled out and converted into a representation that can be programmatically used. Before data is accessed according to the request, the respective permissions are enforced on the current user.

##### Decoding of JWT

Any valid request (i.e. by an authenticated user) to the back-end contains a JWT as `bearer` string in the HTTP authorization header. When a URL endpoint is hit, the token is extracted and decoded (in `auth.requires_auth()`)

The decoding routine (`auth.decode_jwt()`) has to be provided with the public key of the Auth0 domain. The decoding fails with a 401 response if one of the following cases happen:

- the token has expired
- the token audience and issuer do not match the values stored in the back-end
- the token decoding library fails

Any other unexpected error results in a 500 response.

Upon successful decoding, the JWT payload is returned as Python dictionary.

##### Representation of current user

The current user is programmatically represented by the `auth.CurrentUser` class. It has the read-only attributes

- `id`: the user ID
- `organisation_id`: ID of the organisation that the user belongs to. If the user is a god user, it is `None`
- `is_god`: whether the user is god user or not (default: false)
- `_base_ids`: a data structure indicating the bases in which the user is allowed to access specific resources. This structure has to be queried via the `CurrentUser.authorized_base_ids()` method, passing in an RBP name.

The decoded JWT payload is converted into a `CurrentUser` instance with the following procedure:

- if the `permissions` custom claim is a list with a single entry `"*"`, the attribute `is_god` is set to true
- the `organisation_id` custom claim is copied to the eponymous attribute
- the user ID is extracted from the `sub` claim and assigned to `id`
- if `is_god` is false, the permissions custom claim is parsed:
    - an element of form `base_X/permission` (`permission` is an RBP of form `resource:method`) results in the entry `{permission: [X]` for `base_ids`
    - if multiple base IDs are given, they are grouped: `base_X-Y/permission` results in `{permission: [X, Y]`
    - a `write`, `edit`, `create` permission method implies `read` permission on the same resource
    - if the element has no `base_X` prefix, the custom claim `base_ids` is used to form an entry `{permission: base_ids}`
    - for examples please see `CurrentUser.from_jwt()`

##### Enforcement of RBP in resolvers

GraphQL resolvers are functions which are called by the GraphQL server to resolve the requested fields on the data level. Resolvers allow fine-grained access over data resources and hence are suited to enforce RBP.

Enforcement of RBP in the resolvers has to be explicitly called by developers using the `authz.authorize()` function. If the current user is authorized to access a resource acc. to the given arguments, the function returns, otherwise it raises an `exceptions.Forbidden` exception, resulting in an error for the particular GraphQL field being resolved. If the current user is a god user, the function instantly returns. `authz.authorize()` accepts the following combination of arguments (the developer must select the one suitable for the enforcement context):

Arguments | Types | Description | Condition for successful authorization
:--- | :--- | :--- | :---
`permission` | string | RBP name, e.g. `category:read` | the current user was granted the given permission in at least one base
`permission` and `base_id` | string and integer | RBP name and base ID | the current user was granted the given permission in the specified base
`organisation_id` | integer | organisation ID | the current user is member of the organisation with given ID
`organisation_ids` | list of integers | organisation IDs | the current user is member of one of the organisations with given IDs
`user_id` | integer | user ID | the current user's ID matches the given user ID

Any other combination of arguments can be handled by the function but is considered a development error. If no arguments are given, the function raises an exception.

## Consequences
