import 'cypress-file-upload'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const GOOD_FIXTURE = 'template_import/good_template.json'
const IMPORT_URL_PATTERN = '**/projecttemplates/import/json'

const longString = length => 'x'.repeat(length)

const attachPayload = payload =>
  cy.get('[data-test=json-import-file-input]').attachFile({
    fileContent: payload,
    fileName: 'template.json',
    mimeType: 'application/json',
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

const stubImportResponse = (errorCode, message = 'stubbed') => {
  cy.intercept('POST', IMPORT_URL_PATTERN, {
    statusCode: 422,
    body: { errorCode, message },
  })
}

describe('template_json_import_server_other.cy', () => {
  let user

  before(() => {
    createKnowledgeManagerUser('import_other_spec').then(createdUser => {
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

  describe('server validation - posts', () => {
    describe('when a post is missing a name', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[0].name = ''
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the post-missing-name error', () => {
        expectErrorMessage('All posts must have a name')
      })
    })

    describe('when a post name is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[0].name = longString(51)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the post-name-too-long error', () => {
        expectErrorMessage('post name exceeds the maximum length')
      })
    })

    describe('when a post description is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[0].description = longString(1001)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the post-description-too-long error', () => {
        expectErrorMessage('post description exceeds the maximum length')
      })
    })

    describe('when a post URL is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[1].url = longString(2001)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the post-url-too-long error', () => {
        expectErrorMessage('post URL exceeds the maximum length')
      })
    })

    describe('when a post has an invalid type for its URL', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[1].type = 'Bogus Type'
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-post-type error', () => {
        expectErrorMessage('invalid type')
      })
    })

    describe('when a Meeting post has an unparseable startTime', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].posts[3].startTime = 'not-a-date'
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-post-time error', () => {
        expectErrorMessage('start and end times are invalid')
      })
    })

    describe('when INVALID_POST_URL is returned by the server', () => {
      before(() => {
        stubImportResponse('INVALID_POST_URL')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the invalid-post-url error', () => {
        expectErrorMessage('post URL is not a valid URL')
      })
    })
  })

  describe('server validation - resources', () => {
    describe('when exceeding the resource count', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.resources = Array.from({ length: 51 }, (_, i) => ({
            name: `Resource ${i}`,
            url: 'https://example.com',
            image: null,
          }))
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the too-many-resources error', () => {
        expectErrorMessage('maximum resource count')
      })
    })

    describe('when a resource is missing a name', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.resources[0].name = ''
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the resource-missing-name error', () => {
        expectErrorMessage('All resources must have a name')
      })
    })

    describe('when a resource name is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.resources[0].name = longString(71)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the resource-name-too-long error', () => {
        expectErrorMessage('resource name exceeds the maximum length')
      })
    })

    describe('when a resource URL is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.resources[0].url = longString(2001)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the resource-url-too-long error', () => {
        expectErrorMessage('resource URL exceeds the maximum length')
      })
    })
  })

  describe('server validation - template-level', () => {
    describe('when the template description is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.description = longString(501)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the description-too-long error', () => {
        expectErrorMessage('description field exceeds the maximum length')
      })
    })

    describe('when the payload contains a null task entry', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks.push(null)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-payload error', () => {
        expectErrorMessage('malformed')
      })
    })
  })

  describe('server validation - stubbed (unreachable via dialog)', () => {
    describe('when MISSING_NAME is returned by the server', () => {
      before(() => {
        stubImportResponse('MISSING_NAME')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the missing-name error', () => {
        expectErrorMessage('Template name is required')
      })
    })

    describe('when NAME_TOO_LONG is returned by the server', () => {
      before(() => {
        stubImportResponse('NAME_TOO_LONG')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the name-too-long error', () => {
        expectErrorMessage('Template name exceeds the maximum length')
      })
    })

    describe('when SCHEMA_VERSION_MISMATCH is returned by the server', () => {
      before(() => {
        stubImportResponse('SCHEMA_VERSION_MISMATCH')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the schema-mismatch error', () => {
        expectErrorMessage('schema version is not supported')
      })
    })

    describe('when PAYLOAD_TOO_LARGE is returned by the server', () => {
      before(() => {
        stubImportResponse('PAYLOAD_TOO_LARGE')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the size-exceeded error', () => {
        expectErrorMessage('2MB limit')
      })
    })

    describe('when INVALID_CONTENT_TYPE is returned by the server', () => {
      before(() => {
        stubImportResponse('INVALID_CONTENT_TYPE')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the invalid-content-type error', () => {
        expectErrorMessage('must be submitted as JSON')
      })
    })

    describe('when IMPORT_FAILED is returned by the server', () => {
      before(() => {
        stubImportResponse('IMPORT_FAILED')
        openImportDialog()
        loadGood().then(attachPayload)
        enterNameAndSubmit()
      })

      it('should show the import-failed error', () => {
        expectErrorMessage('Upload failed')
      })
    })
  })
})
