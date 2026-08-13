# STAGE - DEV

# FROM openjdk:8 as dev
FROM amazoncorretto:17-alpine-jdk AS dev

RUN apk --no-cache add curl

WORKDIR /app

LABEL maintainer="Juralio <docker@juralio.com>"

# Set Workdir
WORKDIR /app
COPY .ebextensions ./.ebextensions
COPY .platform ./.platform

COPY gradle.properties ./gradle.properties
COPY gradle ./gradle
COPY build.gradle ./build.gradle
COPY gradlew ./gradlew
COPY gradle/codenarc.gradle ./codenarc.gradle
COPY config ./config

# Bringing enough of the grails app over to allow this stage to resolve dependencies
COPY grails-app/conf/application.yml ./grails-app/conf/application.yml

# Copying over the application sources
COPY grails-app ./grails-app
COPY src ./src

RUN ./gradlew build

# if targetting dev you can override building the war to save time starting up
# see docker-compose.yml
ARG BUILD_WAR=true
RUN if [ "$BUILD_WAR" = "true" ]; then ./gradlew war; fi

ENTRYPOINT ["./gradlew"]
CMD ["bootRun"]

# STAGE - DEV-LOCAL
# The image behind docker-compose.local.yml (the one-command local stack).
#
# Unlike the `dev` stage above it deliberately does NOT compile the app or build
# a war at image-build time: the sources are bind-mounted and compiled on first
# boot, so editing code is a container restart rather than an image rebuild.
# Only the Gradle wrapper distribution is baked in; the dependency cache lives
# in the gradle-home volume, so it survives across restarts and rebuilds.
FROM amazoncorretto:17-alpine-jdk AS devlocal

RUN apk --no-cache add curl bash

WORKDIR /app

LABEL maintainer="Juralio <docker@juralio.com>"

COPY gradlew ./gradlew
COPY gradle ./gradle
COPY gradle.properties ./gradle.properties

# Downloads the Gradle distribution into the image so the first `up` doesn't
# spend minutes on it. Named volumes are seeded from the image, so this also
# pre-populates gradle-home.
RUN ./gradlew --no-daemon --version

EXPOSE 8080

ENTRYPOINT ["./gradlew"]
CMD ["bootRun"]

# STAGE - PROD
# Grails 7 (Spring Boot 3 / Jakarta Servlet 6) requires Tomcat 10.1+.
# The corretto variants of this image were abandoned at 10.1.0-M16 (a July
# 2022 pre-release, no security updates since); the temurin (Ubuntu-based)
# tags are the maintained ones.
FROM tomcat:10.1-jdk17-temurin AS prod

RUN apt-get update && apt-get install -y --no-install-recommends curl unzip && rm -rf /var/lib/apt/lists/*

RUN mv /usr/local/tomcat/webapps  /usr/local/tomcat/webapps_old
RUN mkdir /usr/local/tomcat/webapps
RUN mkdir /usr/local/tomcat/conf/ROOT

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

LABEL maintainer="Juralio <docker@juralio.com>"

RUN mv /usr/local/tomcat/webapps  /usr/local/tomcat/webapps_old
RUN mkdir /usr/local/tomcat/webapps
# RUN mkdir /usr/local/tomcat/conf/ROOT

# AWS credentials are deliberately NOT baked into the image. The application uses
# the AWS SDK default credential chain, so supply them at run time via the task /
# instance role, or via AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SDK_REGION
# environment variables. See docs/RUNBOOK-DEPLOYMENT.md.

COPY --from=dev /app/build/libs/juralio.war /usr/local/tomcat/webapps/ROOT.war

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["catalina.sh", "run"]