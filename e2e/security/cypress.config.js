const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../results/test-results.[hash].xml',
  },
  video: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 8000,
  requestTimeout: 15000,
  responseTimeout: 60000,
  pageLoadTimeout: 60000,
  env: {
    serverBaseUrl: 'http://localhost:8080/api',
    serverRootBaseUrl: 'http://localhost:8080',
    defaultPassword: 'Password2Password2$',
  },
  e2e: {
    experimentalRunAllSpecs: true,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3000/',
  },
})
