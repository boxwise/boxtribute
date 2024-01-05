# Migrating FE Build System off create-react-app

Trello-card: Add Link if relevant

Decision Deadline: 2024-01-06

Author: Hans

Discussion Participants: Maik, Vahid, James

## Status

proposed

## Context or Problem Statement

In our mono-repo we created an infra-structure that can hold multiple React apps and component libraries. When importing components from our shared component library, webpack (used by create-react-app) has a problem with resolving imports from the shared component library.

Additionally, create-react-app is deprecated.

## Decision Drivers

1. import resolution is not a problem anymore.
2. reliability: the solution is supported by a large community and is established
3. effort

## Considered Options

1. change settings for webpack build error
2. migrate to vite
3. migrate to turbopack

## Decision: Migrate to vite

- We know that vite has no similar problem for module resolution than webpack since we the statviz app is using vite and we can import from the shared components library.
- We need to migrate from create-react-app at some point anyway since it was deprecated.
- Vite has a large community and is often seen as the new quasi standard for React apps, e.g. it is used under the hood in software from Nx. --> There is a lot of documentation on migrating from create-react-app to vite.
- Turbopack is a very interesting and super fast bundler, but the first release is only six months ago. We consider Turbopack not as established as vite, but we should definitly keep an eye on it.

Only Con:

- solving just the webpack settings would probably be fastest.

## Consequences

- spend an hour on the migration process from cra to vite and see how far we get there. Then finally evaluate if it makes sense to go through with it.
