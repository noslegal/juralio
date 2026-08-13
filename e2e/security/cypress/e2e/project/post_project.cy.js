import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('post_project.cy', () => {
  let orgUsers, otherOrgUsers, fixture

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
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.matterAdmin,
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [{ name: 'template source project', tasks: [] }],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to create a project', () => {
    describe('from scratch', () => {
      let url,
        invocationCount = 0

      const getProjectPayload = () => ({ name: `Project ${invocationCount++}` })

      before(() => {
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams`
      })

      describe('as a MATTER ADMIN', () => {
        before(() => {
          cy.login(orgUsers.matterAdmin.username)
        })

        it('should return CREATED status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectPayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
      })

      describe('as a MATTER TEAM MEMBER and MATTER ADMIN', () => {
        before(() => {
          cy.login(orgUsers.matterAdminAndTeamMember.username)
        })

        it('should return CREATED status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectPayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
      })

      describe('as a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(orgUsers.teamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectPayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(orgUsers.nonTeamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectPayload(),
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
              method: 'POST',
              body: getProjectPayload(),
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })
    })

    describe('from a template', () => {
      let invocationCount = 0
      let templateId, url

      const getProjectFromTemplatePayload = () => ({
        name: `Project From Template ${invocationCount++}`,
        templateid: templateId,
      })

      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
          method: 'POST',
          body: {
            name: 'Anew template',
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          templateId = response.body.id
        })
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams`
      })

      describe('as a MATTER ADMIN', () => {
        before(() => {
          cy.login(orgUsers.matterAdmin.username)
        })

        it('should return CREATED status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectFromTemplatePayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
      })

      describe('as a MATTER TEAM MEMBER and MATTER ADMIN', () => {
        before(() => {
          cy.login(orgUsers.matterAdminAndTeamMember.username)
        })

        it('should return CREATED status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectFromTemplatePayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
      })

      describe('as a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(orgUsers.teamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectFromTemplatePayload(),
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(orgUsers.nonTeamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: getProjectFromTemplatePayload(),
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
              method: 'POST',
              body: getProjectFromTemplatePayload(),
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })
    })
  })
})
