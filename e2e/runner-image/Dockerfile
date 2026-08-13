FROM cypress/included:11.2.0
LABEL maintainer="Juralio <docker@juralio.com>"
# Install local project node dependencies
WORKDIR /usr/src/app
COPY package.json .
RUN sed -i '/"cypress"/d' ./package.json
RUN npm install
COPY desktop ./desktop
COPY mobile ./mobile
COPY upload ./upload
COPY security ./security
COPY helpers ./helpers
COPY page ./page 
COPY support ./support
COPY .eslintrc.json .
COPY test.sh .
ENTRYPOINT ["/bin/bash"]
CMD tail -f /dev/null