# ADR: Improved Frontend Developer Experience
Decision Deadline: Next week (2024-07-15)

Author: [Felipe](https://github.com/fhenrich33)

## Status

Proposed, Implementing

## Context
Frontend development experience in its current form is quite lacking. It imposes some artificial difficulties, tooling doesn't work as expected, and adds friction to our FE contributors.

Local installation of packages and tooling might not play well with the codebase. Things like TS, ESlint, and Prettier might not work without a lot of fiddling. 

We want to make FE development better.

## Decision drivers

1. We must make FE onboarding and development seamless.
2. Implementation must play well with the current FE setup (React/Vite).
3. To add to the prior point: it must be maintainable with minimal hassle in the long term.
4. Implementation must work well with our CI/CD pipeline.
5. Maintainability (and upgradeability to the same extent) must be a priority, in the long term.
6. We must NOT interfere with BE tooling and development.

## Considered options

The only difference between proposed options is how to manage the monorepo, otherwise, there's a lot of overlap on proposed changes:
- **[pnpm](https://pnpm.io/):** The community standard for package management--faster than `npm` and `yarn`, and more forgiving on how it manages and caches `node_modules`. Used prominently by major vendors, libraries, frameworks, and high-profile open source entities. Will replace `yarn`.
- **[husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged):** Improved git hook configuration, also a commonly used tool in the FE ecosystem. This will replace our hand-rolled git hook setup.

Current tooling like `Vite`, `TypeScript`, `ESLint`, and `Prettier` remains the same, and are expected to work flawlessly with these.

Monorepo management:

1. **[Turborepo](https://turbo.build/repo/docs):** Does a lot of lifting for us automatically (type checking, formatting, testing, building, and more), is content aware as it only works on relevant files, caches results of deterministic tasks locally ([and remotely](https://turbo.build/repo/docs/core-concepts/remote-caching), if we require it in the future), and works seamlessly with current and suggested tooling. This wasn't only adopted by major frameworks, libraries, and vendors, but it was also made by the second major React stakeholder: Vercel/NextJS.
2. **[pnpm workspaces](https://pnpm.io/workspaces):** A safer option, at the cost of doing what `Turborepo` does more laboriously and manually. Not a demerit, it's quite doable. It's just that we might be leaving guaranteed wins on the table.

## Decision
The considered options should be an improvement over the current FE setup, both in my own experience and what can be observed in our industry at the time of this writing. Most of these are expected to be installed locally or are already commonplace to FE developers. These also shouldn't interfere with the BE developer experience in any way.

Another highly recommended action: change the required git hook from `pre-commit` to `pre-push`. Let plugins, tooling and IDE/text editor of choice take care of chores like linting and formatting locally in order to remove friction, and rely on CI/CD for the final say on correctness and confidence.

On CI/CD: the presented tooling and strategy should work well with `Circle CI`. See: 

https://turbo.build/repo/docs/crafting-your-repository/constructing-ci

https://turbo.build/repo/docs/guides/ci-vendors/circleci

https://pnpm.io/continuous-integration

## Consequences
There's an initial ramp-up time to change to the suggested implementation. The largest time sink is adapting to our Docker setup. However, these tools, strategies, and changes are rather safe options, as not only prominent libraries and frameworks already use them, but my anecdotal experience with these was very positive. It also paves the way for leveraging next-generation bundlers (e.g. Turbopack, Rspcack, Rolldown, Farm, Mako, et al) once they mature, as these are designed to play rather well with commonly used JS tooling. Thus leaving a path for upgradeability in the mid-term.

For newcomers, and developers who came from old standards: they only need to run the commands, then get acclimated if they desire to push for changes.

## Reference

Video used as one of the foundations for the implementation suggestion: https://www.youtube.com/watch?v=hRyU0bN7qhw

Repos used as reference and inspiration for the mentioned tools and architecture:

https://turbo.build/repo/docs

https://github.com/nodejs/nodejs.org

https://github.com/tailwindlabs/tailwindcss

https://github.com/shadcn-ui/ui

https://github.com/solidjs/solid

https://github.com/solidjs/solid-start

https://github.com/vercel/next.js

*Reference/MVP implementation coming soon™.
