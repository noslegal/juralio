import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers,
    createPopulatedDummyOrg,
    getDummyOrgUserProperties
} from '../../../../helpers/organisation/organisation_api_helper'

describe('patch_update_template_task_order.cy', () => {
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
                tasks: [
                  {
                    name: 'task a',
                    tasks: [
                      { name: 'Vader' },
                      { name: 'Yoda' },
                      { name: 'Luke' },
                    ],
                  },
                  { name: 'task a1' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to update template tasks in organisation', () => {
    let templateID, subtaskIDBody, templateResponse, url

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
        templateResponse = res

        templateID = res.body.id
        subtaskIDBody = [
          { id: res.body.tasks[1].id },
          { id: res.body.tasks[2].id },
          { id: res.body.tasks[0].id },
        ]

        url = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateID}/tasks`
      })
    })

    describe('as an Organisation user with KM role', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            parentTaskId: templateResponse.body.tasks[3].id,
            taskOrder: subtaskIDBody,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as an Organisation user with KM role with non LevelA Tasks', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            taskOrder: subtaskIDBody,
          },
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
          method: 'PATCH',
          body: {
            parentTaskId: templateResponse.body.tasks[0].id,
            taskOrder: subtaskIDBody,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as TEAM MEMBER in the organisation', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            parentTaskId: templateResponse.body.tasks[0].id,
            taskOrder: subtaskIDBody,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as MATTER ADMIN in the organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            parentTaskId: templateResponse.body.tasks[0].id,
            taskOrder: subtaskIDBody,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      describe('when attempting other Verbs on template tasks endpoint', () => {
        ;['HEAD', 'PUT', 'OPTIONS'].forEach(method => {
          it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
            cy.login(orgUsers.matterAdmin.username)
            cy.apiSpecRequest({
              url,
              method: method,
              ...(method !== 'HEAD' && {
                body: {
                  parentTaskId: templateResponse.body.tasks[0].id,
                  taskOrder: subtaskIDBody,
                },
              }),
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
            })
          })
        })
      })
    })

    describe('as MATTER ADMIN and TEAM MEMBER in the organisation', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            parentTaskId: templateResponse.body.tasks[0].id,
            taskOrder: subtaskIDBody,
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
            method: 'PATCH',
            body: {
              parentTaskId: templateResponse.body.tasks[0].id,
              taskOrder: subtaskIDBody,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
