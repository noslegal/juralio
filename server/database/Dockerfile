FROM library/postgres:14.4
LABEL maintainer="Juralio <docker@juralio.com>"

RUN mkdir -p /tmp/psql_data/
COPY _init.sql /tmp/psql_data/init.sql
COPY init.sh /docker-entrypoint-initdb.d/