const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../results/test-results.[hash].xml',
  },
  video: false,
  env: {
    serverBaseUrl: 'http://localhost:8080/api',
    defaultPassword: 'Password2Password2$',
  },
  viewportHeight: 900,
  viewportWidth: 1400,
  userAgent: 'Cypress!',
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
