import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'
import { publishTemplate } from '../../../../helpers/templates/template_api_helper'

describe('get_view_template_tasks.cy', () => {
  let orgUsers, otherOrgUsers, fixture

  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

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
                tasks: [{ name: 'task a' }],
              },
              {
                name: 'Project 2',
                tasks: [{ name: 'task b' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to view all tasks in a given DRAFT template', () => {
    let templateID, url

    before(() => {
      cy.login(orgUsers.knowledgeManager)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      }).then(response => {
        templateID = response.body.id
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks`
      })
    })

    describe('as a standard user', () => {
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

    describe('as a TEAM MEMBER', () => {
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

    describe('as a MATTER ADMIN', () => {
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

    describe('as a MATTER ADMIN and TEAM MEMBER', () => {
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

    describe('as a sysadmin user', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
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

  describe('when trying to view all tasks in a given PUBLISHED template', () => {
    let templateID, url

    before(() => {
      cy.login(orgUsers.knowledgeManager)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      })
        .then(response => {
          templateID = response.body.id
          url = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateID}/tasks`
        })
        .then(() => {
          publishTemplate(templateID)
        })
    })

    describe('as a standard user', () => {
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

    describe('as a TEAM MEMBER', () => {
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

    describe('as a MATTER ADMIN', () => {
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

    describe('as a MATTER ADMIN and TEAM MEMBER', () => {
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

    describe('as a sysadmin user', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
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
