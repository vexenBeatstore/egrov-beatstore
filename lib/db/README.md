# VEXEN BeatStore database

The API uses the workspace PostgreSQL connection through `DATABASE_URL`. Do not
expose that connection string to the browser or include it in logs.

## Development migrations

Generate a migration after changing the Drizzle schema, then apply committed
migrations:

```sh
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
```

Generated SQL is kept in `lib/db/drizzle/`. `migrate` applies those migrations
without dropping existing data.

## Example catalog

The sample beats and prices are explicitly labeled as examples and have no
audio or cover files. To import them into an empty catalog:

```sh
pnpm --filter @workspace/db run seed-demo
```

The command refuses to run if any beat already exists; it does not overwrite
catalog data.

## One-time administrator setup

First register the intended administrator as a normal user. Then run this
command once against the intended database:

```sh
pnpm --filter @workspace/api-server run bootstrap-admin -- admin@example.com
```

The command promotes only the matching registered account, refuses if an
administrator already exists, and uses a PostgreSQL advisory lock to prevent
concurrent first-admin setup. There is no public role-promotion endpoint.

## Not included in this stage

Email verification and password recovery need an email-delivery provider.
Orders, manual payment approval, an admin interface, and protected audio-file
delivery are separate follow-up work; the current cart remains browser-local
and checkout is not enabled.
