#!/usr/bin/env bash

PWD=`pwd`
PROJECT=${1:-e2e}
OPERATION=${2}
SUITE=${3:-mobile}
SUB_SUITE=${4}
AWS_ACCESS_KEY_ID=${5:-aws_access_key_id_unset}
AWS_SECRET_ACCESS_KEY=${6:-aws_secret_acess_key_unset}
TESTS=${7}

do_count=$(grep -ir describe.only ./ --include="*cy.js" | wc -l)
if [ $do_count -gt 0 ]; then
	echo "Describe.only detected in the e2e folder.  Script will now exit."
	exit 1
else
	echo "E2e's are describe.only free. Starting testing..."
fi

SANITIZED_PROJECT_NAME=$(echo ${PROJECT//[-_]/} | tr '[:upper:]' '[:lower:]')
# increase from default 60 to resolve 
# ERROR: An HTTP request took too long to complete
export COMPOSE_HTTP_TIMEOUT=360
export COMPOSE_PROJECT_NAME=$SANITIZED_PROJECT_NAME
export COMPOSE_FILE=docker-compose.yml:docker-compose.e2e-runner-image.yml
declare -a CACHED_IMAGES=(
  "server-db"
  "server"
  "e2e"
  )
readonly SCRIPT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
readonly CACHED_IMAGE_PATH="${SCRIPT_DIRECTORY}/docker-images"

function buildDatabaseImage() {
  buildSQL
  docker compose down
  docker volume rm -f ${SANITIZED_PROJECT_NAME}_juralio_server_data
  
  mkdir -p ${CACHED_IMAGE_PATH}
  local image="server-db"
  docker compose build ${image}

  echo "looking for ${SANITIZED_PROJECT_NAME}_${image}"
  
  local image_id=$(docker image ls | grep "${SANITIZED_PROJECT_NAME}-${image}\s" | awk '{ print $3 }')
  echo "Found image for ${image} with id ${image_id} saving to ${CACHED_IMAGE_PATH}/${image}.tgz"
  docker save ${image_id} | gzip -c > ${CACHED_IMAGE_PATH}/${image}.tgz
  
  docker compose down
  docker volume rm -f ${SANITIZED_PROJECT_NAME}_juralio_server_data
}

function buildServerImage() {
  buildUI
  copyAppFiles

  if [[ -z ${AWS_ACCESS_KEY_ID} ]];
  then
    echo "AWS_ACCESS_KEY_ID variable is NOT set"
  else
    echo "AWS_ACCESS_KEY_ID variable is set"
  fi

  if [[ -z ${AWS_SECRET_ACCESS_KEY} ]];
  then
    echo "AWS_SECRET_ACCESS_KEY variable is NOT set"
  else
    echo "AWS_SECRET_ACCESS_KEY variable is set"
  fi
  
  mkdir -p ${CACHED_IMAGE_PATH}
  local image="server"
  docker compose build --build-arg aws_access_key_id=${AWS_ACCESS_KEY_ID} --build-arg aws_secret_access_key=${AWS_SECRET_ACCESS_KEY} ${image}
  
  echo "looking for ${SANITIZED_PROJECT_NAME}_${image}"

  local image_id=$(docker image ls | grep "${SANITIZED_PROJECT_NAME}-${image}\s" | awk '{ print $3 }')
  echo "Found image for ${image} with id ${image_id} saving to ${CACHED_IMAGE_PATH}/${image}.tgz"
  docker save ${image_id} | gzip -c > ${CACHED_IMAGE_PATH}/${image}.tgz
}

function buildE2eImage() {
  mkdir -p ${CACHED_IMAGE_PATH}
  local image="e2e"
  docker compose build ${image}
  
  echo "looking for ${SANITIZED_PROJECT_NAME}_${image}"

  local image_id=$(docker image ls | grep "${SANITIZED_PROJECT_NAME}-${image}\s" | awk '{ print $3 }')
  echo "Found image for ${image} with id ${image_id} saving to ${CACHED_IMAGE_PATH}/${image}.tgz"
  docker save ${image_id} | gzip -c > ${CACHED_IMAGE_PATH}/${image}.tgz
}

function buildAndSaveImages() {
  buildUI
  copyAppFiles
  buildSQL
  docker compose down
  docker volume rm -f ${SANITIZED_PROJECT_NAME}_juralio_server_data
  env
  docker compose images
  docker compose ps
  docker compose up --build --abort-on-container-exit
  mkdir -p ${CACHED_IMAGE_PATH}

  for image in "${CACHED_IMAGES[@]}"
    do
      local image_id=$(docker compose images | grep "${image}-" | awk '{ print $4 }')
      echo "Found image for ${image} with id ${image_id} saving to ${CACHED_IMAGE_PATH}/${image}.tgz"
      docker save ${image_id} | gzip -c > ${CACHED_IMAGE_PATH}/${image}.tgz
    done
  docker compose down
  docker volume rm -f ${SANITIZED_PROJECT_NAME}_juralio_server_data
}

function loadAndRunImages() {
  # if [ -z "$TESTS" ];
  # then
  #   echo "### Error! Tests is unset. Exiting..."
  #   exit 1
  # fi
  export testfiles=$TESTS

  # Decompress the three images in parallel. They are independent tarballs, so
  # running the (single-threaded) gunzip+load concurrently overlaps what used to
  # be three serial decompressions. Each background load writes its "Loaded
  # image" line to a file so the image id can be recovered after all complete.
  docker load -i ${CACHED_IMAGE_PATH}/server-db.tgz > /tmp/load-server-db.log 2>&1 &
  local pid_db=$!
  docker load -i ${CACHED_IMAGE_PATH}/server.tgz > /tmp/load-server.log 2>&1 &
  local pid_server=$!
  docker load -i ${CACHED_IMAGE_PATH}/e2e.tgz > /tmp/load-e2e.log 2>&1 &
  local pid_e2e=$!
  wait ${pid_db} ${pid_server} ${pid_e2e}

  local db_loaded_id=$(grep -a 'Loaded image' /tmp/load-server-db.log | sed s/^.\*://g)
  local server_loaded_id=$(grep -a 'Loaded image' /tmp/load-server.log | sed s/^.\*://g)
  local e2e_loaded_id=$(grep -a 'Loaded image' /tmp/load-e2e.log | sed s/^.\*://g)

  # server-db must be running before the server boots (Grails connects on start).
  echo "running server-db from ${db_loaded_id}"
  docker run -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=Postgres123 -d --rm --name server-db ${db_loaded_id}

  echo "running server from ${server_loaded_id}"
  docker run --network container:server-db -e JURALIO_VERSION='111.222-333' -e DS_HOST='localhost' -e DS_PORT='5432' -e DS_DB_NAME='juralio' -e DS_USERNAME='juralio' -e DS_PASSWORD='juralio' -e AWS_SDK_REGION='eu-west-2' -e RATE_LIMIT_ENABLED=false -d --rm --name server ${server_loaded_id}

  echo "running e2e from ${e2e_loaded_id}"
  docker run -d --entrypoint bash --ipc="host" --network container:server --rm --name e2e ${e2e_loaded_id} -c 'tail -f /dev/null'
  docker exec -it e2e ./test.sh prod localhost ${SUITE} ${testfiles} ${ignoretestfiles}
  local test_exit_code=$?

  if [ "$test_exit_code" -ne 0 ]; then
    echo "=== Server logs (last 150 lines) ==="
    docker logs --tail 150 server 2>&1 || true
  fi

  mkdir -p e2e/results/
  mkdir -p e2e/${SUITE}/cypress/screenshots/
  mkdir -p e2e/${SUITE}/cypress/videos/
  
  docker cp e2e:/usr/src/app/results/. e2e/results/
  docker cp e2e:/usr/src/app/${SUITE}/cypress/screenshots/. e2e/${SUITE}/cypress/screenshots/
  docker cp e2e:/usr/src/app/${SUITE}/cypress/videos/. e2e/${SUITE}/cypress/videos/

  exit "$test_exit_code"
}

function buildSQL() {
  INIT_FILE=server/database/_init.sql
  echo "Generating database initialisation scripts ..."
  cat server/database/init.sql > $INIT_FILE
  cat server/dataset/clean_entire_schema.sql >> $INIT_FILE
}

function copyAppFiles() {
  rm -f server/src/main/webapp/index.html
  rm -rf server/src/main/webapp/assets
  rm -rf server/src/main/webapp/frontend
  cp Juralio-App/dist/index.html server/src/main/webapp/index.html
  cp -r Juralio-App/dist/assets/. server/src/main/webapp/assets
  cp -r frontend/build/. server/src/main/webapp/
  cp -r frontend/maintain_bookmarks server/src/main/webapp/frontend
  mv -f server/src/main/webapp/frontend/locales server/src/main/webapp/ || true
}

function buildUI() {
  # if CI variable is not set
  if [ -z ${CI+x} ]; then
    echo 'Building frontend ...'
    cd $PWD/frontend && ./docker-run.sh build &
    wait
    echo 'Packaging frontend ...'
    cd $PWD/frontend && ./docker-run.sh package &
    wait
    cd $PWD
  fi
}

if [ $OPERATION = "build_and_save" ]
then
  requestedImage=${3:-''}

  if [ $requestedImage = "server-db" ]
  then
    buildDatabaseImage
  elif [ $requestedImage = "server" ]
  then
    buildServerImage
  elif [ $requestedImage = "e2e" ]
  then
    buildE2eImage
  else
    buildAndSaveImages
  fi
else
  loadAndRunImages
fi
