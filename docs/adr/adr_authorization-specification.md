# ADR: Authorization Specification

[Trello card](https://trello.com/c/kypUAjlw/747-20-create-agile-design-documents-artifacts-about-authorization-implementation)

Decision deadline: irrelevant since implementation pending

Author: Philipp (@pylipp)

Discussion participants: Vahid (@vahidbazzaz), Roanna (@aerinsol), Hans (@HaGuesto)

## Status

Implementation on-going.

A first proposal for authorization design can be found [here](https://docs.google.com/document/d/1DYkwryrE4Q-Me-ZGFGzKJEm_VIWCXyghmjmLLFVwlxc/edit#heading=h.if4ha4s3dg7).

## Context

The `boxtribute` application is used by various organisations to manage distribution of aid goods. Some data stored contains personal, confidential information of individuals in vulnerable situations. These individuals have a right to privacy, hence their data must not be exposed to unintended parties. Implementation of authorization measures is required to define and enforce data excess depending on the current application user.

The current document serves as a summary of decisions about user authorization in the boxtribute application.

## Decision drives

1. Security: exposure of confidential data must be prohibited for legal and ethical reasons
1. Clarity: make the governing structures easy to understand for stakeholders (users, product management, developers)
1. Single source of trust: data for controlling authorization must not be distributed
1. Simplicity during development: enforcing authorization should be straightforward for developers while guaranteeing security
1. Maintainability: management of roles and permissions should have little overhead and be extensible
1. Integration in both dropapp and boxtribute 2.0

## Authorization in boxtribute

### Fundamental concepts

#### Organisation and base

The `boxtribute` partner organisations operate in one or more sites each, called `bases`. Any registered user belongs to exactly one organisation, and one or more bases subordinated to this organisation. Hence they must not be granted access to any resource outside of the organisation or bases they're assigned to (there are exceptions to this rule depending on the context, e.g. for box transfers).

#### Roles

A role reflects the user's responsibilities in the partner organisations. Currently, these roles exist:

- administrator (head of operations)
- coordinator
- warehouse volunteer
- free shop volunteer
- library volunteer
- label creator
- God user (note: this is an application administration role and does not belong to a specific partner organisation)

#### Permissions

Depending on the user group, a user is able to perform certain actions. In our authorization concept, these actions are mirrored by action-based permissions (ABP).
ABPs represent functions in the application that the user who was granted the ABPs can execute. Examples: viewing the inventory, or managing products. The name of an ABP consists of a verb indicating the action, and a plural noun (if applicable), separated by underscore: `manage_products`, `view_inventory`, etc.

In the application back-end however it needs to be distinguished which data a user is allowed to access in what way. This is achieved through resource-based permissions (RBP).
An RBP refers to a resource in the database, and the methods that the user who was granted the RBP can execute. These methods correspond to database operations:

- read: `SELECT`
- create: `INSERT`
- edit: `UPDATE`
- write: `INSERT`, `UPDATE`
- delete: `DELETE`
- assign: `INSERT` into cross-reference table

The naming convention for RBP is a singular noun (the resource; multi-word nouns concatenated by underscore), and a method name, separated by colon: `user:edit`, `beneficiary:create`, `tag_relation:read`, etc.

Every ABP comprises one or more RBP, e.g. the ABP `manage_tags` stands for `tag:write`, `stock:read`, `tag_relation:read`, and `beneficiary:read`.

The mapping of usergroup to ABPs, and ABP to RBPs is listed in [this document](https://docs.google.com/spreadsheets/d/1W4YWcc59wUFUWgReumdH6DQ4zU7JcTgvf6WEbdqaGHQ/edit#gid=0).

### User management in Auth0

[Auth0](https://auth0.com) is a service for managing user authentication and authorization. It serves as single source of truth. An authenticated user gets issued a JSON Web Token (JWT) in one of two variants holding their information: the ID token with authentication information, and the access token with authorization information. For signing the JWT we use the RS256 algorithm: the token will be signed with our private signing key and can be verified using our public signing key.

#### Reasons to use Auth0

Cf. [related ADR](./adr_auth0.md)

#### User entity in Auth0

Any user registered for boxtribute has their authorization data (`app_metadata`) stored in the Auth0 database. The user attributes are:

- `is_god`: `"1"` for god user, `"0"` otherwise
- `usergroup_id`: the ID of the usergroup the user belongs to
- `base_ids`: a list of base IDs that the user has access to
- `organisation_id`: the ID of the organisation the user belongs to

During registration, the user manually gets assigned a role, indicating their usergroup and the bases they belong to. The role is named like `base_1_coordinator`.

When the user has successfully logged in, a custom Auth0 post-login action script runs ([`create-dynamic-permissions`](https://github.com/boxwise/system-management/blob/main/services/auth0/dev/actions/create-dynamic-permissions/code.js)). The script creates a JWT with the content derived from user authorization data and their role.
Most importantly the script derives ABPs and base-specific RBPs for the current user (see below about their format). Auth0 permissions assigned to the user currently have no effect.

#### Specification of custom JWT

The JWT (access and ID token, unless specified otherwise) contains standard and customs fields.

Field name | Kind | Description | Usage
:--- | :--- | :--- | :---
`iss` | standard | Name of token issuer | JWT decoding
`aud` | standard | Name of token audience | JWT decoding
`iat` | standard | Unix timestamp of issuing datetime | -
`exp` | standard | Unix timestamp of expiration datetime | JWT decoding
`azp` | standard | ID of client through which the JWT was requested | traceability of application used for authentication
`gty` | standard | Grant type | -
`sub` | standard | User ID | see [below](#representation-of-current-user)
`https://www.boxtribute.com/email` | custom | User email | -
`https://www.boxtribute.com/roles` | custom | List of user's roles | -
`https://www.boxtribute.com/base_ids` | custom | List of IDs of bases that the user has access to | see [below](#representation-of-current-user)
`https://www.boxtribute.com/organisation_id` | custom | ID of the organisation the user belongs to | see [below](#representation-of-current-user)
`https://www.boxtribute.com/permissions` | custom | List of RBPs that the user holds (only in access token) | see [below](#representation-of-current-user)

### Implementation of authorization

#### Dropapp

When a new base is created, the following is automatically created:
- in dropapp the usergroups: administrator (only created when an organisation is created), coordinator, volunteer (combination of warehouse/free shop volunteer), warehouse volunteer, free shop volunteer, label creator.
- in Auth0 all roles (see [above](#roles) which roles are created).
- in dropapp database table `usergroups_roles` a mapping between the user groups and roles.

The mapping between user groups in dropapp and roles in Auth0 is needed because only one user group can be assigned to a user in dropapp, but multiple roles can be assigned to a user in Auth0.

When a user is created/edited a user group must be assigned. Through the mapping the corresponding roles are then assigned in Auth0 to the user.

Dropapp does not use the JWT since it's a server-side application.

#### boxtribute 2.0 front-end

The information of the JWT ID token is used.

[Work in progress.](https://trello.com/c/HvzKBexq)

#### boxtribute 2.0 back-end

When a user issues a request to the back-end, their authorization information needs to be pulled out and converted into a representation that can be programmatically used. Before data is accessed according to the request, the respective permissions are enforced on the current user.

##### Decoding of JWT

Any valid request (i.e. by an authenticated user) to the back-end contains a JWT access token as `bearer` string in the HTTP authorization header. When a URL endpoint is hit, the token is extracted and decoded (in `auth.requires_auth()`)

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
- `timezone`: timezone identifier determined by Auth0, e.g. "Europe/Berlin"

The decoded JWT payload is converted into a `CurrentUser` instance with the following procedure:

- if the list of the `roles` custom claim contains `"boxtribute_god"`, the attribute `is_god` is set to true
- the `organisation_id` custom claim is copied to the eponymous attribute
- the user ID is extracted from the `sub` claim and assigned to `id`
- if `is_god` is false, the permissions custom claim is parsed:
    - an element of form `base_X/permission` (`permission` is an RBP of form `resource:method`) results in the entry `{permission: [X]` for `base_ids`
    - if multiple base IDs are given, they are grouped: `base_X-Y/permission` results in `{permission: [X, Y]` (in order to reduce payload size)
    - a `write`, `edit`, `create`, `delete` permission method implies `read` permission on the same resource
    - if the element has no `base_X` prefix, the custom claim `base_ids` is used to form an entry `{permission: base_ids}`
    - for examples please see `CurrentUser.from_jwt()`

##### Enforcement of RBP in resolvers

GraphQL resolvers are functions which are called by the GraphQL server to resolve the requested fields on the data level. Resolvers allow fine-grained access over data resources and hence are suited to enforce RBP. **Every resolver must enforce RBP in one of the ways described below.**

Resolvers can either (A) directly return a single resource entry, (B) directly return a list of resource entries, or (C) load one or more resource entries through a data loader. Enforcement of RBP works differently in these cases.

**(A)** Enforcement of RBP in the single-resource resolver has to be explicitly called by developers using the `authz.authorize()` function. If the current user is authorized to access a resource acc. to the given arguments, the function returns, otherwise it raises an `exceptions.Forbidden` exception, resulting in an error for the particular GraphQL field being resolved. If the current user is a god user, the function instantly returns. `authz.authorize()` accepts the following combination of arguments (the developer must select the one suitable for the enforcement context):

Arguments | Types | Description | Condition for successful authorization
:--- | :--- | :--- | :---
`permission` | string | base-agnostic RBP name, e.g. `category:read` | the current user was granted the given permission in at least one base
`permission` and `base_id` | string and integer | base-related RBP name and base ID | the current user was granted the given permission in the specified base
`permission` and `base_ids` | string and list of integers | base-related RBP name and base IDs | the current user was granted the given permission in at least one of the specified bases
`organisation_id` | integer | organisation ID | the current user is member of the organisation with given ID
`organisation_ids` | list of integers | organisation IDs | the current user is member of one of the organisations with given IDs
`user_id` | integer | user ID | the current user's ID matches the given user ID

Any other combination of arguments can be handled by the function but is considered a development error. If no arguments are given, the function raises an exception.

Note that it is distinguished between base-agnostic (e.g. box state, product category, size range) and base-related resources (e.g. box, beneficiary, product, tag). The former are listed in `BASE_AGNOSTIC_RESOURCES` in the `authz` module. Any resources missing from the list are assumed to be base-related. When enforcing base-related RBP via `authorize()`, either `base_id` or `base_ids` argument must be provided.

**(B)** A filter needs to be applied to select only those resource entries in bases that the user is authorized for. This is achieved via the `authorized_bases_filter(model)` function which enforces permission for the resource corresponding to the specified model under the hood.

**(C)** When loading a resource through a data loader, one can omit enforcement of RBP in the loader. However in the loader's `batch_load_fn()` method, one of `authorize()` or `authorized_base_ids()` must be called. This reduces permission enforcement overhead.

## Consequences
