FROM node:20-alpine
LABEL maintainer="Juralio <docker@juralio.com>"

# Install local project node dependencies
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN rm -f .npmrc
RUN npm install
RUN rm -f .npmrc

COPY eslint.config.mjs .
COPY babel.config.js .
COPY jest.setup.js .
COPY src ./src
COPY vite.config.js .
COPY index.html .
COPY test ./test
COPY public ./public
ENTRYPOINT ["npm"]
CMD ["start"]