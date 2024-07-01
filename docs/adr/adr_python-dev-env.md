# ADR: Python Development Environment

Author: [Philipp](https://github.com/orgs/boxwise/people/pylipp)

## Status

Implementation Complete.

## Context

The main programming language for the present repository is Python. The Python ecosystem features a rich set of tools and libraries that facilitate developing an industry-standard codebase. Development includes implementation of production and test code in an environment built on linting and formatting tools.

## Decision drives

1. Test-driven development
1. Code maintainability
1. Code scalability
1. Code format consistency

## Considered options

### Testing

- Python's built-in [unittest](https://docs.python.org/3.6/library/unittest.html) module
- [pytest](https://docs.pytest.org/en/latest/)

### Code formatting

- [yapf](https://github.com/google/yapf)
- [black](https://github.com/psf/black)
- [isort](https://github.com/PyCQA/isort)

### Linting

- [pylint](http://pylint.pycqa.org/en/latest/)
- [flake8](https://flake8.pycqa.org/en/latest/index.html#quickstart)
- [flake8-bugbear](https://github.com/PyCQA/flake8-bugbear)

### Miscellaneous

- [pre-commit](https://pre-commit.com/)
- [venv](https://docs.python.org/3.6/library/venv.html) module

## Decision

1. Testing: `pytest`. Compared to unittest, test code is more concise yet readable, test fixture setup is straightforward, and test assertion output is very clear and helpful for debugging.
1. Code formatting: `black`. Developed by the Python Software Foundation themselves. Uncompromising, fast, deterministic. Also `isort` for consistent formatting of import statements.
1. Linting: `flake8`. Detection of common code smells. `pylint` tends to be pickier and might hinder rapid initial development. The `flake8-bugbear` plugin picks on likely bugs and design problems in the source code.
1. Integration with `git`: `pre-commit`. Automatic style checks prior to committing. Orchestration of style check tools.
1. Isolated Python development environment: `venv`. Isolation of system and project Python packages in so called 'virtual environments'.

## Consequences

### Easier

- Writing tests for production code is encouraged
- The codebase has a consistent format in high quality. Changes submitted by developers follow defined conventions
- potential bugs are prevented

### More difficult

- Developers have to set up a local development environment before contributing
- Output of style check tools can be unfamiliar to newcomers
