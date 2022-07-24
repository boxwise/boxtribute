# ADR: Authentication with Auth0

Discussion Participants: [Roanna](https://github.com/orgs/boxwise/people/aerinsol), [Hans](https://github.com/orgs/boxwise/people/HaGuesto), [James](https://github.com/orgs/boxwise/people/jamescrowley), [Stephan](https://github.com/orgs/boxwise/people/naphets123)

## Status

Completed - See trello card: https://trello.com/c/8KEgl3nv

## Context or Problem Statement

Our handling of user data is far from bullet-proof. We have stumbled upon cases where SQL injection is possible and the current password encryption is only md5. Additionally, we are building a new mobile app in React and Flask and need to implement a way to handle authentication there.

## Decision Drivers

1. Security / Risk for us
2. Ease of Use
3. Cost


## Considered Options

- Building our own authentication solution
- Google Firebase
- Auth0

## Decision

We are going for Auth0 since
- we have prior experience with Auth0 in the team,
- a first test in an afternoon coding session were satisfying and
- Auth0 offers a free plan for Open-source projects.

We are not building our own authentication solution to reduce the security risks coming with handling g passwords.

## Consequences

### Easier:

- We can almost drop a whole user flow.

### More difficult:

- Switching between mobile and desktop application.
