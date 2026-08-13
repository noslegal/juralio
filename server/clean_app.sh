#!/usr/bin/env bash

# Script to stop app, wipe local database and restart the app
# Make an environment variable for your database password to save typing it each time:
# export PGPASSWORD=password
./grailsw stop-app | psql --host=localhost --username juralio --dbname juralio -a -f ./database/clean_entire_schema.sql | ./grailsw clean | ./grailsw run-app