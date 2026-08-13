import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('favourite_template.cy', () => {
  let orgUsers, otherOrgUsers, fixture, url

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

  describe('when trying to favourite an unpublished template', () => {
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
        templateID = response.body.id
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/favourite`
      })
    })

    describe('as a standard user', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to favourite a template', () => {
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
          templateID = response.body.id
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/admin/projecttemplates/${templateID}`,
            method: 'PATCH',
            body: {
              published: true,
            },
          })
        })
        .then(response => {
          url = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateID}/favourite`
        })
    })

    describe('as a standard user', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
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
          method: 'POST',
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
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
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
          method: 'POST',
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
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when trying to unfavourite a template', () => {
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
          templateID = response.body.id
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/admin/projecttemplates/${templateID}`,
            method: 'PATCH',
            body: {
              published: true,
            },
          })
        })
        .then(response => {
          cy.login(orgUsers.teamMember.username)
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/projecttemplates/${templateID}/favourite`,
            method: 'POST',
          })
        })
        .then(response => {
          url = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateID}/favourite`
        })
    })

    describe('as a standard user', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return 200 status', () => {
        cy.apiSpecRequest({
          url,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return 200 status', () => {
        cy.apiSpecRequest({
          url,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return 200 status', () => {
        cy.apiSpecRequest({
          url,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
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
          method: 'DELETE',
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
            method: 'DELETE',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('when attempting other verbs on the favourite template tasks endpoint', () => {
      const verbs = ['PUT', 'PATCH']

      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })
      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })

  describe('when attempting other verbs on the favourite template tasks endpoint', () => {
    const verbs = ['PUT', 'PATCH']

    beforeEach(() => {
      cy.login(orgUsers.teamMember.username)
    })
    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })
})
