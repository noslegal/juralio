import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'

describe('get_template_task.cy', () => {
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
              { name: 'Other Project', tasks: [] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to get a template task in organisation', () => {
    let draftTemplateID,
      publishedTemplateID,
      draftSubtaskId,
      publishedSubtaskID,
      url,
      anotherTemplateId

    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('draft template', fixture.projects[0].id)
        .then(template => {
          draftTemplateID = template.id
          draftSubtaskId = template.tasks[0].id
        })
        .then(() => {
          createTemplate('published template', fixture.projects[0].id).then(
            template => {
              publishedTemplateID = template.id
              publishedSubtaskID = template.tasks[0].id
              publishTemplate(publishedTemplateID)
              url = `${Cypress.env(
                'serverBaseUrl'
              )}/projecttemplates/${publishedTemplateID}/tasks/${publishedSubtaskID}`
            }
          )
        })
        .then(() => {
          createTemplate('another template', fixture.projects[1].id).then(
            template => {
              anotherTemplateId = template.id
              publishTemplate(anotherTemplateId)
            }
          )
        })
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

    describe('as an Organisation user with KM role', () => {
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

    describe('when trying to access the task from the wrongtemplate', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${anotherTemplateId}/tasks/${draftSubtaskId}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when trying to access the task from a draft template', () => {
      describe('when trying to access the task from a organisation user without knowledge manager role', () => {
        before(() => {
          cy.login(orgUsers.teamMember.username)
        })
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/projecttemplates/${draftTemplateID}/tasks/${draftSubtaskId}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('when trying to access the task from a organisation user with knowledge manager role', () => {
        before(() => {
          cy.login(orgUsers.knowledgeManager.username)
        })
        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/projecttemplates/${draftTemplateID}/tasks/${draftSubtaskId}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })
  })
})
