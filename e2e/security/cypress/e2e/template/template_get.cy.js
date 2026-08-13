import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg, getDummyOrgUserProperties
} from '../../../../helpers/organisation/organisation_api_helper'
import {
    createTemplate,
    publishTemplate
} from '../../../../helpers/templates/template_api_helper'

describe('template_get.cy', () => {
  let fixture, orgUsers, otherOrgUsers, template

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'Matter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to access a DRAFT template', () => {
    let url

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('Template', fixture.projects[0].id).then(body => {
        template = body
        url = `${Cypress.env('serverBaseUrl')}/projecttemplates/${template.id}`
      })
    })

    describe('as a user in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a user in the same organisation with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
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
          url,
          method: 'GET',
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
          url,
          method: 'GET',
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
            url,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when trying to access a PUBLISHED template', () => {
    let url

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('Template', fixture.projects[0].id)
        .then(body => {
          template = body
          url = `${Cypress.env('serverBaseUrl')}/projecttemplates/${
            template.id
          }`
        })
        .then(() => {
          publishTemplate(template.id)
        })
    })

    describe('as a user in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a user in the same organisation with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER in the same organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
