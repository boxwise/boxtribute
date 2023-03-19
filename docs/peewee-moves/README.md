# Database Schema Migrations

`peewee-moves` was used to experiment with as a database schema migration tool in the past; it's not part of the tools we use in production.

Currently we use [Phinx to run migrations](https://github.com/boxwise/dropapp/tree/master/db/migrations) via dropapp.

## Instructions

Occasionally it might be required to update the database schema. To this end we use the [peewee-moves](https://github.com/timster/peewee-moves) tool.
`peewee-moves` runs migrations defined in Python scripts, and stores a migration history in the database. Migration management is performed by the `flask db` command. In the development environment you can
1. run `docker-compose up` to start all services
1. run `docker-compose exec webapp sh` to open a shell in the `webapp` container. Run `flask db --help` from there
1. You can create an empty migration script via `flask db revision <migration-name>`. The file name receives an auto-incremented index. The creation date-time is stored in the top script docstring.
1. Implement `upgrade()` and `downgrade()` functions in the script for defining the rollforward/rollback behavior.
1. Apply all pending migrations by `flask db upgrade`, and rollback the latest migration by `flask db downgrade`.
1. Query the current migration status of the database via `flask db status`.

Migration scripts must be stored in `back/boxtribute_server/migrations`, and are put under version-control.

For an example migration, see `docs/peewee-moves/`.
