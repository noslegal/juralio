import HttpStatus from 'http-status-codes'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const IMPORT_URL = () =>
  `${Cypress.env('serverBaseUrl')}/projecttemplates/import/json`

const VALID_IMPORT_PAYLOAD = {
  published: false,
  archived: false,
  name: 'Security Import Test Template',
  description: null,
  tasks: [
    {
      id: 'CT1',
      name: 'Phase A',
      level: 1,
      isMilestone: false,
      isDeliverable: false,
      tasks: [],
      posts: [],
      description: null,
    },
  ],
  resources: [{ name: 'A Resource', url: 'www.google.com', image: null }],
  metadata: {
    instance: 'test.juralio.com',
    schemaVersion: 1,
    submitterId: 1,
    submissionDate: '2026-01-01T00:00:00.000Z',
    submitterOrgId: 1,
    submittedTemplateId: 1,
    version: 0,
  },
}

describe('template_json_import.cy', () => {
  let orgUsers, otherOrgUsers, kmAndOrgAdmin, orgAdminOnly, kmOnly

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('importOtherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() =>
        createUser(undefined, true, true, {
          roles: ['ROLE_ORG_ADMIN', 'ROLE_KNOWLEDGE_MANAGER'],
        })
      )
      .then(user => {
        kmAndOrgAdmin = user
      })
      .then(() =>
        createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] })
      )
      .then(user => {
        orgAdminOnly = user
      })
      .then(() =>
        createUser(undefined, true, true, {
          roles: ['ROLE_KNOWLEDGE_MANAGER'],
        })
      )
      .then(user => {
        kmOnly = user
      })
  })

  describe('when trying to import a template from JSON', () => {
    describe('as a user with KNOWLEDGE MANAGER and ORG ADMIN roles', () => {
      before(() => {
        cy.login(kmAndOrgAdmin.username)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })

    describe('as a KNOWLEDGE MANAGER without ORG ADMIN role', () => {
      before(() => {
        cy.login(kmOnly.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as an ORG ADMIN without KNOWLEDGE MANAGER role', () => {
      before(() => {
        cy.login(orgAdminOnly.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a standard user in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: IMPORT_URL(),
          method: 'POST',
          body: VALID_IMPORT_PAYLOAD,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url: IMPORT_URL(),
            method: 'POST',
            body: VALID_IMPORT_PAYLOAD,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('when attempting other verbs on the import endpoint', () => {
      const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']

      beforeEach(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url: IMPORT_URL(),
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })

  describe('when the request body fails validation', () => {
    // Authorised importer so we exercise the validation layer rather than the auth gate.
    beforeEach(() => {
      cy.login(kmAndOrgAdmin.username)
    })

    const payloadWith = mutate => {
      const payload = Cypress._.cloneDeep(VALID_IMPORT_PAYLOAD)
      mutate(payload)
      return payload
    }

    const expectUnprocessable = (response, errorCode) => {
      expect(response.status).to.eq(HttpStatus.UNPROCESSABLE_ENTITY)
      expect(response.body.errorCode).to.eq(errorCode)
    }

    it('rejects a malformed JSON body with INVALID_PAYLOAD', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ this is not valid json',
      }).then(response => expectUnprocessable(response, 'INVALID_PAYLOAD'))
    })

    it('rejects a non-object JSON body with INVALID_PAYLOAD', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: [1, 2, 3],
      }).then(response => expectUnprocessable(response, 'INVALID_PAYLOAD'))
    })

    it('rejects a non-JSON content type with INVALID_CONTENT_TYPE', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(VALID_IMPORT_PAYLOAD),
      }).then(response => expectUnprocessable(response, 'INVALID_CONTENT_TYPE'))
    })

    it('rejects a non-numeric schemaVersion with SCHEMA_VERSION_MISMATCH', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: payloadWith(p => {
          p.metadata.schemaVersion = 'abc'
        }),
      }).then(response =>
        expectUnprocessable(response, 'SCHEMA_VERSION_MISMATCH')
      )
    })

    it('rejects metadata that is not an object with SCHEMA_VERSION_MISMATCH', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: payloadWith(p => {
          p.metadata = 'not-an-object'
        }),
      }).then(response =>
        expectUnprocessable(response, 'SCHEMA_VERSION_MISMATCH')
      )
    })

    it('rejects an unsupported schemaVersion with SCHEMA_VERSION_MISMATCH', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: payloadWith(p => {
          p.metadata.schemaVersion = 2
        }),
      }).then(response =>
        expectUnprocessable(response, 'SCHEMA_VERSION_MISMATCH')
      )
    })

    it('rejects a non-boolean isMilestone with INVALID_PAYLOAD', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: payloadWith(p => {
          p.tasks[0].isMilestone = 'false'
        }),
      }).then(response => expectUnprocessable(response, 'INVALID_PAYLOAD'))
    })

    it('rejects a missing template name with MISSING_NAME', () => {
      cy.apiSpecRequest({
        url: IMPORT_URL(),
        method: 'POST',
        body: payloadWith(p => {
          p.name = ''
        }),
      }).then(response => expectUnprocessable(response, 'MISSING_NAME'))
    })
  })
})
