#/bin/bash
command=$1
containerid=${2:-local}
case "$command" in
  bash)
    docker run -it --entrypoint bash $containerid/frontend
    ;;
  build)
    docker build -t $containerid/frontend .
    ;;
  package)
    [ -f .env.local ] && export $(grep -v '^#' .env.local | xargs)
    docker stop $containerid-frontend-package
    docker rm $containerid-frontend-package
    docker run -i -e CI=true \
      -e GENERATE_SOURCEMAP="${GENERATE_SOURCEMAP:=false}" \
      -e VITE_GOOGLE_API_CLIENT_ID="${VITE_GOOGLE_API_CLIENT_ID}" \
      -e VITE_GOOGLE_API_APP_ID="${VITE_GOOGLE_API_APP_ID}" \
      -e VITE_GOOGLE_API_SCOPE="${VITE_GOOGLE_API_SCOPE}" \
      -e VITE_GOOGLE_API_DEVELOPER_KEY="${VITE_GOOGLE_API_DEVELOPER_KEY}" \
      --name $containerid-frontend-package $containerid/frontend run build
    result=$?
    docker cp $containerid-frontend-package:/usr/src/app/build .
    docker rm $containerid-frontend-package
    exit $result
    ;;
  unit)
    docker run -i --name $containerid-frontend-unit $containerid/frontend test
    result=$?
    docker rm $containerid-frontend-unit
    exit $result
    ;;
  unit-ci)
    docker run -i --name $containerid-frontend-unit-ci $containerid/frontend run test:ci
    result=$?
    docker cp $containerid-frontend-unit-ci:/usr/src/app/test-report.xml .
    docker rm $containerid-frontend-unit-ci
    exit $result
    ;;
  *)
    echo "Usage: $0 bash|build|eslint|package|unit|unit-ci <revisionid>"
    ;;
esac
