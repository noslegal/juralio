#/bin/bash
command=$1
containerid=${2:-local}
case "$command" in
  build)
    docker build --target dev --build-arg BUILD_WAR=false -t $containerid/srv .
    cp database/init.sql database/_init.sql
    docker build -t $containerid/db ./database
    ;;
  package)
    #Build and package into WAR. Ensuring that WAR is placed in normal grails build
    #output directory.
    mkdir -p ./build/libs
    docker run -i --name $containerid-srv-package $containerid/srv war
    docker cp $containerid-srv-package:/app/build/libs/juralio.war ./build/libs
    docker rm $containerid-srv-package
    ;;
  unit)
    docker network create --driver bridge $containerid-nw
    docker run -d --network $containerid-nw --name $containerid-db $containerid/db
    docker run -i --network $containerid-nw --name $containerid-srv-unit -e "TEST_DB_HOSTNAME=$containerid-db" $containerid/srv test-app $3
    exitCode="$?"
    if [ $exitCode != 0 ]; then
      echo "Tests failed"
      exit 1
    fi
    docker cp $containerid-srv-unit:/app/build/test-results .

    docker stop $containerid-db
    docker rm $containerid-srv-unit
    docker rm $containerid-db
    docker network rm $containerid-nw
    ;;
  *)
    echo "Usage: $0 build|package|unit <revisionid>"
    ;;
esac