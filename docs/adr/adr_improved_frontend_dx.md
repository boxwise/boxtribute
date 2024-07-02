# ADR: Improved Frontend Developer Experience
Decision Deadline: As soon as possible

Author: [Felipe](https://github.com/fhenrich33)

## Status

Proposed, Implementing

## Context
Frontend development experience in its current form is quite lacking. Imposes a lot of artificial difficulties, tooling doesn't work as expected, and adds friction to our FE contributors.

We want to make FE development better.

## Decision drivers

1. We must make FE onboarding and development seamless.
2. Implementation must play well with the current FE setup (React/Vite).
3. Implementation must work well with our CI/CD pipeline.
4. We must NOT interfere with BE tooling and development.

## Considered options

The only difference between proposed options is how to manage the monorepo, otherwise, there's a lot of overlap on proposed changes:
- **[pnpm](https://pnpm.io/):** The "new" unwritten standard for package management--faster than both `npm` and `yarn`, and more forgiving on how it manages and caches `node_modules`. Will replace `yarn`.
- **[husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged):** Improved git hook configuration, also an unwritten standard in the FE ecosystem. Will replace our manual git hook setup.

Current tooling like `Vite`, `TypeScript`, `ESLint`, and `Prettier` remains the same, and are expected to work flawlessly with these.

Monorepo management:

1. **[Turborepo](https://turbo.build/repo/docs):** Does a lot of lifting for us automatically, is content aware so it only works on relevant files, caches results of deterministic tasks locally ([and remotely](https://turbo.build/repo/docs/core-concepts/remote-caching), if we have a need for it in the future), and works seamlessly with current and suggested tooling.
2. **[pnpm workspaces](https://pnpm.io/workspaces):** A safer option, at the cost of doing what `Turborepo` does in a more laborious and manual way.

## Decision
The considered options should be an improvement over the current FE setup, both in my own experience and what can be observed in our industry at the time of this writing. Most of these are expected to be installed locally or already heavily used by our FE developers. These also shouldn't interfere with the BE developer experience in any way.

Another highly recommended action: change the required git hook from `pre-commit` to `pre-push`. Let plugins, tooling and IDE/text editor of choice take care of chores like linting and formatting locally in order to remove friction, and rely on CI/CD for the final say on correctness and confidence.

On CI/CD: the mentioned tooling and strategy should work well with `Circle CI`. See: 

https://turbo.build/repo/docs/crafting-your-repository/constructing-ci

https://turbo.build/repo/docs/guides/ci-vendors/circleci

https://pnpm.io/continuous-integration

## Consequences
Aside from the initial ramp-up time to change to the suggested implementation--nothing. These tools, strategies, and changes are rather safe options, as not only prominent libraries and frameworks already use them, but my anecdotal experience with these was very positive. It also paves the way for leveraging next-generation bundlers (e.g. Turbopack, Rspcack, Rolldown, Farm, Mako, et al) once they mature, as these are designed to play nice with commonly used JS tooling.

## Reference

Video used as one of the foundations for the implementation suggestion: https://www.youtube.com/watch?v=hRyU0bN7qhw

*Reference/MVP implementation coming soon™.
