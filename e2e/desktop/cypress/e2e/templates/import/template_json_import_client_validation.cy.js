import 'cypress-file-upload'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const GOOD_FIXTURE = 'template_import/good_template.json'

const longString = length => 'x'.repeat(length)

const attachPayload = payload =>
  cy.get('[data-test=json-import-file-input]').attachFile({
    fileContent: payload,
    fileName: 'template.json',
    mimeType: 'application/json',
    encoding: 'utf8',
  })

const attachRawContent = (
  content,
  fileName = 'template.json',
  mimeType = 'application/json'
) =>
  cy.get('[data-test=json-import-file-input]').attachFile({
    fileContent: content,
    fileName,
    mimeType,
    encoding: 'utf8',
  })

const enterNameAndSubmit = (name = 'Imported Test Template') => {
  cy.get('[data-test=json-import-rename-field]')
    .find('input')
    .clear()
    .type(name)
  cy.get('[data-test=action-dialog-button]').click()
}

const expectErrorMessage = messageFragment => {
  cy.get('[data-test=json-import-error]').should(
    'contain.text',
    messageFragment
  )
}

describe('template_json_import_client_validation.cy', () => {
  let user

  before(() => {
    createKnowledgeManagerUser('import_client_spec').then(createdUser => {
      user = createdUser
    })
  })

  const openImportDialog = () => {
    cy.login(user.username)
    cy.visit('/#/templates')
    cy.get('[data-test=import-template-json-button]', {
      timeout: 20000,
    }).click()
  }

  const loadGood = () =>
    cy.fixture(GOOD_FIXTURE).then(p => JSON.parse(JSON.stringify(p)))

  describe('client-side validation', () => {
    describe('when uploading a non-JSON file', () => {
      before(() => {
        openImportDialog()
        attachRawContent('not json', 'template.txt', 'text/plain')
      })

      it('should show the invalid-file error', () => {
        expectErrorMessage('not a valid Juralio template')
      })
    })

    describe('when uploading a malformed JSON file', () => {
      before(() => {
        openImportDialog()
        attachRawContent('{this is not valid json}')
        enterNameAndSubmit()
      })

      it('should show the invalid-file error', () => {
        expectErrorMessage('not a valid Juralio template')
      })
    })

    describe('when uploading a JSON file missing metadata', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          delete payload.metadata
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-file error', () => {
        expectErrorMessage('not a valid Juralio template')
      })
    })

    describe('when uploading a JSON file with tasks not an array', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks = { foo: 'bar' }
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-file error', () => {
        expectErrorMessage('not a valid Juralio template')
      })
    })

    describe('when uploading a JSON file with a mismatched schema version', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.metadata.schemaVersion = 999
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the schema-mismatch error', () => {
        expectErrorMessage('schema version is not supported')
      })
    })
  })

  describe('client-side validation - oversize file', () => {
    describe('when uploading a file over 2MB', () => {
      before(() => {
        openImportDialog()
        attachRawContent(longString(2_000_001))
      })

      it('should show the size-exceeded error', () => {
        expectErrorMessage('2MB limit')
      })
    })
  })
})
