### Adding migrations

Migrations live in `grails-app/migrations/`, are written in Grails' Liquibase syntax, and are listed in `grails-app/migrations/changelog.groovy`. They are applied automatically when the app boots (`grails.plugin.databasemigration.updateOnStart: true` in `application.yml`), so there is no separate migrate step to run locally or on deploy.

> The `grails dbm-gorm-diff` / `dbm-changelog-sync` commands that used to be documented here are gone. They came from the standalone `grails` CLI, which this project no longer installs: under Grails 7 the CLI ships as `grails-shell-cli`, and that artifact is deliberately excluded from the build (its `WebApplicationInitializer` breaks the deployed WAR — see the exclusion on `grails-data-hibernate5-dbmigration` in [build.gradle](build.gradle)). Write migrations by hand instead, as below.

#### Writing a migration

You can create a new migration by running:

```
./create-migration.sh add_my_cool_new_table
```

...which creates a new file at grails-app/migrations/<timestamp>\_add_my_cool_new_table.groovy and adds the `include` for it to `changelog.groovy`. Fill the file in to mutate the database however you need. Existing migrations in that folder are the best reference; articles such as https://medium.com/wizpanda/custom-groovy-changes-using-grails-db-migration-plugin-part-i-c51d4ee96a6e can also help.

### Starting from an empty database

There is no changelog-sync step. Point the development dataSource at an empty database and start the app — `updateOnStart` runs every migration in `changelog.groovy` from scratch. To wipe a local database first, run `database/clean_entire_schema.sql` against it and restart (`./start.sh reset` does the same thing for the containerised local stack).

### Running CodeNarc (Static Analyser)

[CodeNarc](http://codenarc.sourceforge.net/) is a static anaylser for Groovy & Grails code.  It can help point us towards errors or opportunities to improve our code.  You can run it with the following command in your `juralio-mm/server` folder:

```
	./gradlew check
```

This will produce html output files under `juralio-mm/server/build/reports/codenarc`.

The set of rules applied during the check are configured in juralio-mm/server/config/codenarc/rules.groovy, and the report format is specified in juralio-mm/server/gradle/codenarc.gradle.
