import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg, getDummyOrgUserProperties
} from '../../../../helpers/organisation/organisation_api_helper'

describe('create_template_post.cy', () => {
  let orgUsers, otherOrgUsers, fixture, url

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
        url = `${Cypress.env('serverBaseUrl')}/projecttemplates`
      })
  })

  describe('when trying to create a new template', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
    
    describe('as a MATTER TEAM MEMBER with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
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
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
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
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when not a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
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
            body: {
              name: 'new template',
              projectId: fixture.projects[0].id,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
