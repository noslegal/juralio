import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('delete_template_task.cy', () => {
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

  describe('when trying to DELETE a template task in organisation', () => {
    let templateID, subtaskID, url, templateId2

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
        subtaskID = res.body.tasks[0].id
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks/${subtaskID}`
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
          method: 'POST',
          body: {
            name: 'new template',
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          let res = response
          templateId2 = res.body.id
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

    describe('when trying to delete from the wrong template', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateId2}/tasks/${subtaskID}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as an Organisation user', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
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

    describe('as an Organisation user with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return NO_CONTENT status', () => {
        cy.apiSpecRequest({
          url,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NO_CONTENT)
        })
      })
    })
  })
})
