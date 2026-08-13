// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { cypressEsbuildPreprocessor } = require('cypress-esbuild-preprocessor')
const xlsx = require('node-xlsx').default
const fs = require('fs')
const path = require('path')

module.exports = (on, config) => {
  // trashAssetsBeforeRuns only covers screenshots and videos, so the files
  // pulled down by the export specs (.docx, .xlsx) would otherwise pile up in
  // cypress/downloads run after run.
  on('before:run', () => {
    fs.rmSync(config.downloadsFolder, { recursive: true, force: true })
  })

  // `on` is used to hook into various events Cypress emits
  on('task', {
    parseXlsx({ filePath }) {
      return new Promise((resolve, reject) => {
        try {
          const jsonData = xlsx.parse(fs.readFileSync(filePath))
          resolve(jsonData)
        } catch (e) {
          reject(e)
        }
      })
    },
  }),
    on(
      'file:preprocessor',
      cypressEsbuildPreprocessor({
        esbuildOptions: {
          // optional tsconfig for typescript support and path mapping (see https://github.com/evanw/esbuild for all options)
          //tsconfig: path.resolve(__dirname, '../../tsconfig.json'),
        },
      })
    )
}
