import HttpStatus from 'http-status-codes'
import {
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createBlankTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('template_json_export.cy', () => {
  let kmUser,
    nonTeamMember,
    teamMember,
    matterAdmin,
    matterAdminAndTeamMember,
    otherOrgUsers,
    template,
    exportUrl

  before(() => {
    createUser(undefined, true, true, { roles: ['ROLE_KNOWLEDGE_MANAGER'] })
      .then(user => {
        kmUser = user
      })
      .then(() => createUser(undefined, true, true, { roles: [] }))
      .then(user => {
        nonTeamMember = user
      })
      .then(() => createUser(undefined, true, true, { roles: [] }))
      .then(user => {
        teamMember = user
      })
      .then(() => createUser(undefined, true, true, { roles: [] }))
      .then(user => {
        matterAdmin = user
      })
      .then(() => createUser(undefined, true, true, { roles: [] }))
      .then(user => {
        matterAdminAndTeamMember = user
      })
      .then(() => createPopulatedDummyOrg('exportOtherOrg'))
      .then((users) => {
        otherOrgUsers = users
      })
      .then(() => {
        cy.login(kmUser.username)
        createBlankTemplate('Export Security Test Template').then(
          createdTemplate => {
            template = createdTemplate
            exportUrl = `${Cypress.env('serverBaseUrl')}/projecttemplates/${
              template.id
            }/export/json`
          }
        )
      })
  })

  describe('when trying to export a template as JSON', () => {
    describe('as a KNOWLEDGE MANAGER in the same organisation', () => {
      before(() => {
        cy.login(kmUser.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a standard user in the same organisation', () => {
      before(() => {
        cy.login(nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN in the same organisation', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(matterAdminAndTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({ url: exportUrl, method: 'GET' }).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('when the template does not exist', () => {
      before(() => {
        cy.login(kmUser.username)
      })

      it('should return NOT FOUND status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/projecttemplates/0/export/json`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when attempting other verbs on the export endpoint', () => {
      const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']

      beforeEach(() => {
        cy.login(kmUser.username)
      })

      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({ url: exportUrl, method: verb }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })
})
