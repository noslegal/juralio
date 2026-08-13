import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'

describe('move_template_task.cy', () => {
  let orgUsers, otherOrgUsers, fixture, template2, template

  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  const startsAtAEndsUpAtB = 'Starts at A ends up at B'
  const startsAtBEndsUpAtA = 'Starts at B ends up at A'
  const willFailToBeMoved = 'Will fail to be moved'
  const fullDestination = 'Full destination'
  const willMoveToTemplate2 = 'Will move to template2'

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
                    name: 'Level A Task',
                    tasks: [
                      { name: startsAtBEndsUpAtA },
                      { name: willFailToBeMoved },
                      {
                        name: fullDestination,
                        tasks: Array.from({ length: 8 }, (v, i) => ({
                          name: `${i}`,
                        })),
                      },
                    ],
                  },
                  {
                    name: startsAtAEndsUpAtB,
                  },
                  { name: willMoveToTemplate2 },
                ],
              },
              {
                name: 'Project 2',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to move a template task', () => {
    let aToBRequest,
      bToARequest,
      moveToFullDestinationRequest,
      moveToOtherProjectTemplateRequest

    const getTemplateTaskMoveUrl = (template, taskName) =>
      `${Cypress.env('serverBaseUrl')}/projecttemplates/${template.id}/tasks/${
        template.tasks.find(t => t.name === taskName).id
      }/move`

    beforeEach(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('Test Template 2', fixture.projects[1].id)
        .then(template2Response => {
          template2 = template2Response
        })
        .then(() => createTemplate('Test Template 1', fixture.projects[0].id))
        .then(template1 => {
          template = template1
          aToBRequest = {
            url: getTemplateTaskMoveUrl(template1, startsAtAEndsUpAtB),
            body: {
              destinationParentType: 'TASK',
              destinationParentId: template1.tasks[0].id,
            },
            method: 'POST',
          }
          bToARequest = {
            url: getTemplateTaskMoveUrl(template1, startsAtBEndsUpAtA),
            body: {
              destinationParentType: 'PROJECT',
              destinationParentId: template1.id,
            },
            method: 'POST',
          }
          moveToFullDestinationRequest = {
            url: getTemplateTaskMoveUrl(template1, willFailToBeMoved),
            body: {
              destinationParentType: 'TASK',
              destinationParentId: template1.tasks.find(
                t => t.name === fullDestination
              ).id,
            },
            method: 'POST',
          }
          moveToOtherProjectTemplateRequest = {
            url: getTemplateTaskMoveUrl(template1, willMoveToTemplate2),
            body: {
              destinationParentType: 'CROSS_PROJECT',
              destinationParentId: template2.id,
            },
            method: 'POST',
          }
        })
    })

    describe('as a standard user with KM role', () => {
      beforeEach(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      describe('moving a task from level A to level B', () => {
        it('should return OK status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return OK status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return BAD_REQUEST status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return OK status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.OK)
            }
          )
        })
      })
    })

    describe('as a standard user', () => {
      beforeEach(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      describe('moving a task from level A to level B', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })

      describe('moving a task from level A to level B', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('as a MATTER ADMIN', () => {
      beforeEach(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      describe('moving a task from level A to level B', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER', () => {
      beforeEach(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      describe('moving a task from level A to level B', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('as a sysadmin user', () => {
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      describe('moving a task from level A to level B', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task from level B to level A', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to a full destination parent task', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('moving a task to another project', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest(bToARequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
          cy.apiSpecRequest(aToBRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
          cy.apiSpecRequest(moveToFullDestinationRequest).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
          cy.apiSpecRequest(moveToOtherProjectTemplateRequest).then(
            response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            }
          )
        })
      })
    })

    describe('when attempting other verbs on the copy template tasks endpoint', () => {
      const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']

      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })
      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            ...aToBRequest,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
          cy.apiSpecRequest({
            ...bToARequest,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
          cy.apiSpecRequest({
            ...moveToFullDestinationRequest,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
          cy.apiSpecRequest({
            ...moveToOtherProjectTemplateRequest,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })
})
