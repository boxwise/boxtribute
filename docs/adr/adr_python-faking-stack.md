# ADR: Python stack for test data generation

Decision Deadline: 2024-05-01

Author: pylipp

## Status

~Proposed.~ Accepted.

## Context or Problem Statement

For testing purposes we used to generate a database seed in dropapp, however due to the update to PHP 8.2 the `faker` library became incompatible.

It was decided to move the functionality of generating fake, realistic test data to the v2 repository, and use appropriate Python packages.

Packages are required for two distinct purposes:

1. object generation
2. data faking

## Decision Drivers

1. Package maintenance quality (popularity, number of maintainers, maintenance state, ...)
1. Feature richness
1. Integration with peewee ORM
1. Usability for development

## Considered Options

### Object generation

- `factory_boy` [1]
    - 3.4k GitHub stars, latest release 3.3.0 in July 2023, 123 contributors, 4 core maintainers, continuous commits
    - integration with peewee through small custom module similar to [2]
- `mixer` [3]
    - 930 GitHub stars, latest release 7.2.2 in March 2022, 38 contributors, one core maintainer, latest commit two years ago
    - built-in peewee integration
- full list: [4]

### Data faking

- `faker` [5]
    - 17k GitHub stars, latest release v24.14.1 in April 2024, 528 contributors, one core maintainer, continuous commits
    - MIT license
    - bundled in `factory_boy`
    - support for localization of fake data, setting randomization seed
- `mimesis` [6]
    - 4.3k GitHub stars, latest release 16.0.0 in March 2024, 112 contributors, one core maintainer, continuous commits
    - MIT license
    - integration with `factory_boy` possible
    - support for localization of fake data, setting randomization seed
    - about 12x faster than `faker` (0.13s vs 1.7s for 10k data points) [7]
- full list: [8]

## Decision

- **Object generation**: `factory_boy`. The only maintained solution right now, quite popular, with continuous updates. Inspired by the PHP faker library that we used before. We have to develop a peewee integration ourselves though. CAVEAT: if functions from the v2 back-end business logic are used to generate fake data, it might not be sensible to use `factory_boy` because this would require to duplicate business logic in the faking program.
- **Data faking**: `faker`. Very popular, well maintained. Performance compared to `mimesis` is worse but likely irrelevant for the size of our data set.

## Consequences

None.

## Links

- [1] https://github.com/FactoryBoy/factory_boy
- [2] https://github.com/cam-stitt/factory_boy-peewee
- [3] https://github.com/klen/mixer
- [4] https://python.libhunt.com/categories/298-object-factories
- [5] https://github.com/joke2k/faker
- [6] https://github.com/lk-geimfari/mimesis
- [7] https://mimesis.name/en/master/about.html#performance
- [8] https://python.libhunt.com/categories/300-fake-data
