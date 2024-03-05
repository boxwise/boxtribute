# Migrating FE Build System off create-react-app

Last Updated: 2024-02-20

Author: @HaGuesto

Discussion Participants: @MaikNeubert, @vahidbazzaz, @jamescrowley

## Status

accepted

## Context or Problem Statement

In our mono-repo we created an infra-structure that can hold multiple React apps and component libraries. When importing components from our shared component library, webpack (used by create-react-app) has a problem with resolving imports from the shared component library.

Additionally, create-react-app is deprecated.

## Decision Drivers

1. import resolution is not a problem anymore.
2. reliability: The likelihood that the solution can handle both the conditions of a production environment without issues (data loss, user interruptions, unexpected failures) at the load we're expecting
3. maintainability: The likelihood that the solution will remain viable in terms of security, reliability, compatibiliy, and so on with a minimum of additional effort by our team over a given period.
4. migration effort

## Considered Options

1. fix only what's broken and do migration for cra later: change settings for webpack build error.
2. migrate now and fix problem through migration: migrate to vite
3. migrate now and fix problem through migration: migrate to turbopack

## Decision: Migrate to vite

- We know that the vite bundler can resolve modules that we are importing from other modules of our mono-repo. The statviz app is using vite and we can import from the shared components library.
  --> It definitely solves the problem
- create-react-app was deprecated and we will need to migrate in the near future.
- Vite has a large community and is often seen as the new quasi standard for React apps, e.g. it is used under the hood in the widely used mono-repo software Nx.
  --> vite is reliable in production and well maintained over years.
- There is a lot of documentation on migrating from create-react-app to vite.
- Turbopack is a rather new bundler that is gaining a lot of interest.It has strong claims about being faster than vite, but the first release is only six months ago. We consider Turbopack not as established as vite, but we should definitly keep an eye on it. Especially, this might be an option when introducing a mono-repo builder like Nx or turborepo.

## Consequences

- spend an hour on the migration process from cra to vite and see how far we get there. Then finally evaluate if it makes sense to go through with it. (done)
- migration to vite seemed easiest at first and we executed it. (done)
- Unfortunately, I overlooked what the migration meant for the front-end tests. Since vite does not provide an out of the box provide test runner, we also had to dig into using vitest vs. jest. We decided to migrate the test runner to vitest since it worked best with vite and I did not manage a quick solution for integrating jest with vite which was my first approach (took me about 2hrs). Even though the migration from jest to vitest seemed to be straight forward (the syntax is almost the same), I ran into problems since quite a tests not were not isolated and I had to refactor many tests. The migration from jest to vitest was done within one hour, but refactoring all our tests took me at least a whole day.
