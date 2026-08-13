#!/usr/bin/env bash
command=${1}
hostname=${2:-localhost}
testsuite=${3}
testfiles=${4:-"**/*.js"}
ignoretestfiles=${5}

# export DEBUG=cypress:*
case "$command" in
  dev)
    # The dev frontend runs on 3000 by default (frontend/vite.config.js, and ./start.sh).
    # Override with JURALIO_FRONTEND_PORT if you published it on one of the other
    # permitted dev ports (9090 / 3007) — see docs/RUNBOOK-LOCAL-SETUP.md.
    export CYPRESS_baseUrl=http://${hostname}:${JURALIO_FRONTEND_PORT:-3000}/ # development
    export CYPRESS_serverBaseUrl=http://${hostname}:8080/api
    ;;
  prod)
    export CYPRESS_baseUrl=http://${hostname}:8080/ # production
    export CYPRESS_serverBaseUrl=${CYPRESS_baseUrl}api
    ;;
  *)
    echo "Usage: $0 dev|prod <hostname> <testsuite>"
    exit
    ;;
esac

echo "running $testsuite cypress suite against host ${hostname}"
echo "including tests $testfiles"
echo "ignoring tests $ignoretestfiles"

specs=$testfiles

# if [ "$ignoretestfiles" = "" ]
# then
#   config="watchForFileChanges=false,testFiles=$testfiles"
# else
#   config="watchForFileChanges=false,testFiles=$testfiles,ignoreTestFiles=$ignoretestfiles"
# fi

echo "cypress specs $specs"

./node_modules/.bin/wait-on -t 300000 http-get://${hostname}:8080/health
# ./node_modules/.bin/cypress run -P ./$testsuite --config $config
./node_modules/.bin/cypress run -P ./$testsuite --spec=$specs