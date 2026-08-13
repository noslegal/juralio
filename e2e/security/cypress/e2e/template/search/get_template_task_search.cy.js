import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg, getDummyOrgUserProperties
} from '../../../../../helpers/organisation/organisation_api_helper'
import { publishTemplate } from '../../../../../helpers/templates/template_api_helper'

describe('get_template_task_search.cy', () => {
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
                name: 'Project 1',
                tasks: [{ name: 'task a' }, { name: 'task a1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to search for a DRAFT template task in an organisation', () => {
    let templateID

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      }).then(response => {
        let res = response
        templateID = res.body.id
      })
    })

    describe('with a search term', () => {
      let url

      before(() => {
        const searchTerm = 'new'
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks/search?name=${searchTerm}`
      })

      describe('as an Organisation user', () => {
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

      describe('as a TEAM MEMBER in the organisation', () => {
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

      describe('as a MATTER ADMIN in the organisation', () => {
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

      describe('as a MATTER ADMIN and TEAM MEMBER in the organisation', () => {
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

    describe('without a search term', () => {
      let url

      before(() => {
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks/search`
      })

      describe('as an Organisation user', () => {
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

      describe('as a TEAM MEMBER in the organisation', () => {
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

      describe('as a MATTER ADMIN in the organisation', () => {
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

      describe('as a MATTER ADMIN and TEAM MEMBER in the organisation', () => {
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
  })

  describe('when trying to search for a PUBLISHED template task in an organisation', () => {
    let templateID

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      })
        .then(response => {
          let res = response
          templateID = res.body.id
        })
        .then(() => {
          publishTemplate(templateID)
        })
    })

    describe('with a search term', () => {
      let url

      before(() => {
        const searchTerm = 'new'
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks/search?name=${searchTerm}`
      })

      describe('as an Organisation user', () => {
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

      describe('as a TEAM MEMBER in the organisation', () => {
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

      describe('as a MATTER ADMIN in the organisation', () => {
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

      describe('as a MATTER ADMIN and TEAM MEMBER in the organisation', () => {
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

    describe('without a search term', () => {
      let url

      before(() => {
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks/search`
      })

      describe('as an Organisation user', () => {
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

      describe('as a TEAM MEMBER in the organisation', () => {
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

      describe('as a MATTER ADMIN in the organisation', () => {
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

      describe('as a MATTER ADMIN and TEAM MEMBER in the organisation', () => {
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
})
