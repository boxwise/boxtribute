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

##### Decoding of JWT

##### Enforcement of RBP in resolvers

## Consequences
