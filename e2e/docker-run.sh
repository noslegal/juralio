#!/usr/bin/env bash
HOSTNAME=$(hostname)

command=$1
containerid=${2:-local}
case "$command" in
  bash)
    docker run -it --entrypoint bash $containerid/e2e
    ;;
  build)
    docker build -t $containerid/e2e .
    ;;
  eslint)
    docker run -i --name $containerid-e2e-eslint $containerid/e2e eslint
    result=$?
    docker rm $containerid-e2e-eslint
    exit $result
    ;;
  run)
    echo "running docker with $containerid/e2e dev $HOSTNAME"
    docker run -i --ipc=host --name $containerid-e2e-package $containerid/e2e dev $HOSTNAME
    result=$?
    docker cp $containerid-e2e-package:/usr/src/app/results/test-results.xml \
    ./results/test-results.xml
    docker cp $containerid-e2e-package:/usr/src/app/mobile/cypress/videos/. \
    ./mobile/cypress/videos
    docker cp $containerid-e2e-package:/usr/src/app/mobile/cypress/screenshots/. \
    ./mobile/cypress/screenshots
    #take care of desktop dir if exists
    docker cp $containerid-e2e-package:/usr/src/app/desktop/cypress/videos/. \
    ./mobile/cypress/videos
    docker cp $containerid-e2e-package:/usr/src/app/desktop/cypress/screenshots/. \
    ./desktop/cypress/screenshots
    docker rm $containerid-e2e-package
    exit $result
    ;;
  *)
    echo "Usage: $0 bash|build|eslint|run <revisionid>"
    ;;
esac