# ADR: Python ORM 
Discussion participants: [Roanna](https://github.com/orgs/boxwise/people/aerinsol), [David C](https://github.com/orgs/boxwise/people/jdcsgh), [Katie](https://github.com/orgs/boxwise/people/mcgnly)

## Status

Accepted, implementation complete. 

## Context

Up to now, database changes have been managed through [Phinx](https://phinx.org/) in PHP, with SQL queries written as strings in PHP. Since we are migrating off of the old PHP code base of Dropapp and into the new codebase of Python / React, we needed to decide how to handle reading and writing to the DB going forward (GraphQL does not solve this, as you still have to hook the GraphQL interface into the DB somehow). 

## Decision drivers

1. Learning Curve
2. Community Support
3. Power and Reliability considering it will be used in a production environment

## Considered options

1. **Pure SQL Strings in Python (no ORM).** Would require all back-end and full-stack devs to pick up SQL. David C strongly recommended against this as it runs contrary to best practice, and because interpolating SQL strings into Python code means that it can't be read or parsed by debuggers, formatters, and other utilities.
2. **[SQLAlchemy](https://www.sqlalchemy.org/):** The clear industry leader within the Python community. Used in web application development across many frameworks, including Flask and Django. However, although David C. also uses it professionally, he recommends against its use for this project given its structure of loosely-affiliated developers at different experience levels. To use SQLAlchemy properly requires significant up-front investment into understanding its complexity, including mastering concepts such as [session management](https://docs.sqlalchemy.org/en/13/orm/session.html) and [relationship loading](https://docs.sqlalchemy.org/en/13/orm/loading_relationships.html).
3. **[Peewee](http://docs.peewee-orm.com/en/latest/):** ORM driven primarily by single maintainer, on 3.0 stable release. Designed to be simpler, smaller, and more hackable than SQLAlchemy, while still remaining expressive and composable. Has generated some controversy in the open source community on account of the main contributors's behavior (not being very open to contributions), but still has a significant community on Github. Fast releases.
4. **[PonyORM](https://ponyorm.org/):** Less mature than Peewee (0.x release), but comes with some useful utilities such as a data diagram modeler. Like Peewee, is mostly driven by a single contributor.


## Decision
Peewee. Despite SQLAlchemy being the gold standard of ORMs, there are no long-term volunteers who have mastered that library aside from David C. The difficulty of ramping up everyone on SQLAlchemy and maintaining it outweighs the difficulty of having potential volunteers who are familiar with SQLAlchemy pick up one of the "easier" ORMs. Comparing the release notes of Peewee and PonyORM, David C. commented that Peewee's recent releases relate to support of edge cases and new technology stacks, whereas PonyORM releases still appear to involve developing functionality and fixing bugs around core uses cases. We therefore concluded that Peewee is the more production-ready solution.

## Consequences

### Easier
- [Philipp](https://github.com/orgs/boxwise/people/pylipp) is using Peewee professionally in his place of work at Reactive Robotics, which indicates that the concern of SQLAlchemy being the industry gold standard we should move towards is not too big of an issue
- Peewee comes with a [flask integration](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#flask-utils)


### More difficult
- Harder for people already fluent with SQL but not Python ORMs to audit queries 
