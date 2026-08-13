import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { publishTemplate } from '../../../../../helpers/templates/template_api_helper'

describe('template_admin_update.cy', () => {
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
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to update a DRAFT template', () => {
    let template, templateId, url

    before(() => {
      cy.login(orgUsers.knowledgeManager)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template test',
          projectId: fixture.projects[0].id,
        },
      }).then(response => {
        template = response.body
        templateId = template.id
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/admin/projecttemplates/${templateId}`
      })
    })

    describe('When not authenticated', () => {
      before(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/logout`,
          method: 'POST',
        })
      })
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: url,
          method: 'PATCH',
          body: { name: 'My Name Is Changed By An Intruder' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('When  authenticated', () => {
      describe('as a knowledge manager user', () => {
        before(() => {
          cy.login(orgUsers.knowledgeManager.username)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: {
              name: 'My Name Is Changed',
              description: 'This is a new description for a template',
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
            expect(response.body.name).to.eq('My Name Is Changed')
            expect(response.body.description).to.eq(
              'This is a new description for a template'
            )
          })
        })
      })

      describe('When  authenticated', () => {
        describe('as a standard user - no KM role', () => {
          before(() => {
            cy.login(orgUsers.teamMember.username)
          })

          it('should return FORBIDDEN status', () => {
            cy.apiSpecRequest({
              url,
              method: 'PATCH',
              body: {
                name: 'My Name Is Changed',
                description: 'This is a new description for a template',
              },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })

      describe('as another org user', () => {
        before(() => {
          cy.login(otherOrgUsers.teamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: { name: 'My Name Is Changed' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('as SysAdmin', () => {
        before(() => {
          cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: { name: 'My Name Is Changed' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when trying to update a PUBLISHED template', () => {
    let template, templateId, url

    before(() => {
      cy.login(orgUsers.knowledgeManager)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template test',
          projectId: fixture.projects[0].id,
        },
      })
        .then(response => {
          template = response.body
          templateId = template.id
          url = `${Cypress.env(
            'serverBaseUrl'
          )}/admin/projecttemplates/${templateId}`
        })
        .then(() => {
          publishTemplate(templateId)
        })
    })

    describe('When not authenticated', () => {
      before(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/logout`,
          method: 'POST',
        })
      })
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: url,
          method: 'PATCH',
          body: { name: 'My Name Is Changed By An Intruder' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('When  authenticated', () => {
      describe('as a knowledge manager user', () => {
        before(() => {
          cy.login(orgUsers.knowledgeManager.username)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: {
              name: 'My Name Is Changed',
              description: 'This is a new description for a template',
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
            expect(response.body.name).to.eq('My Name Is Changed')
            expect(response.body.description).to.eq(
              'This is a new description for a template'
            )
          })
        })
      })

      describe('When  authenticated', () => {
        describe('as a standard user - no KM role', () => {
          before(() => {
            cy.login(orgUsers.teamMember.username)
          })

          it('should return FORBIDDEN status', () => {
            cy.apiSpecRequest({
              url,
              method: 'PATCH',
              body: {
                name: 'My Name Is Changed',
                description: 'This is a new description for a template',
              },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })

      describe('as another org user', () => {
        before(() => {
          cy.login(otherOrgUsers.teamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: { name: 'My Name Is Changed' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('as SysAdmin', () => {
        before(() => {
          cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: { name: 'My Name Is Changed' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
