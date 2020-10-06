# Merge boxwise-flask and boxwise-react repo to a monorepo

The reasoning for this ADR is mainly based on the following two medium articles regarding monorepos:
- [Monorepo: Please don't](https://medium.com/@mattklein123/monorepos-please-dont-e9a279be011b)
- [Monorepo: please do](https://medium.com/@adamhjk/monorepo-please-do-3657e08a4b70)

Decision Deadline: 10th of July 20

## Status

In progress (September 27, 2020)

## Context or Problem Statement

We are an all remote team with only bi-weekly or monthly team calls. Therefore, communication between the dev team members and transparency for all members is of the highest priority. At the moment, we have the frontend and backend code separated in two repos. We already see that the documentation is not in the same state on both repos and not all the information is in one place. The instructions to set-up the dev environment is distributed and is confusing for new people.
In a monorepo architecture, frontend and backend developers can work on small tasks completely separately from each other, and coordinate more easily for more complex, far-reaching task.  

## Decision Drivers 

- team communication
- shared responsibility among volunteers
- no technical disadvantages in comparison to a Poly-Repo.

## Considered Options

- Mono-Repo
- Poly-Repo (current state)

## Decision

Mono-Repo

*Pro:*
- The main reason to move to a monorepo set-up is to force us to communicate/coordinate with each other and to feel a shared responsibility for the monorepo.

other side-effects
- deployment is easier since only one deployment script is needed.
- management of frontend vs. backend versioning is reduced to a minimum. For each deployed version, you have a state at which you know that FE and BE worked together. 
- the development set-up simplifies since only one repo needs to be cloned and React could be run from within Docker.
- all developers are aware when master is broken. If they cannot fix it they could encourage others. 

*Con:*
Technically, there are problems that come with a Mono-repo set up: slow code search, time for testing, chaotic repo,...
However, according to our sources these problems really surface when 
- the codebase becomes so large a virtual filing system is needed, such as VFS for Git from Microsoft.
- we have hundreds of developers on our team.

## Consequences

- James is working on a step-by-step plan to move the two repos together.
- Frontend and Backend will only touch in the docker-compose file
