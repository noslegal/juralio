import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg, getDummyOrgUserProperties
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('post_template_task_posts.cy', () => {
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

  describe('when trying to view post a new task to a given template', () => {
    let template, templateId, templateTaskId, url

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
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
        templateTaskId = template.tasks[0].id
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`
      })
    })

    describe('as a standard user', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'nw', privatePost: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a standard user with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'nw', privatePost: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
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
            body: { name: 'nw', privatePost: false },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
