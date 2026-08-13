import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('patch_task_validate_parameters.cy', () => {
  let teamMember
  let fixture, fixture2
  let matter1Id, matter2Id

  before(() => {
    createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] })
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember],
            matterAdmins: [teamMember],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Other Project',
                tasks: [{ name: 'Task2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)

        const seed2 = {
          matter: {
            teamMembers: [teamMember],
            matterAdmins: [teamMember],
            projects: [
              {
                name: 'CHEESE 1',
                tasks: [
                  {
                    name: 'Task1',
                    tasks: [
                      {
                        name: 'SHEESE',
                        tasks: [
                          {
                            name: 'Pizza',
                            tasks: [
                              {
                                name: 'CHEESE',
                                tasks: [
                                  {
                                    name: 'Pizza',
                                    tasks: [{ name: 'monkey' }],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: 'Other Project',
                tasks: [{ name: 'Task2' }],
              },
            ],
          },
        }
        fixture2 = generateFixture(seed2)
      })
  })

  describe('when patching a task as non-MTM', () => {
    it('should return OK status', () => {
      matter1Id = fixture.matter.id
      matter2Id = fixture2.matter.id

      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[2].id}/task/${fixture.tasks[4].id}`,
        method: 'PATCH',
        body: {
          description: 'Toby',
          id: fixture2.tasks[0].id,
          project: fixture2.projects[0],
          matterId: matter2Id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    describe('When they retrieve the 1st matter', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matter1Id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('When they retrieve the 2nd matter', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matter2Id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('When they retrieve all matters', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matters?allMatters=true`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when trying to retrieve a project', () => {
      let url

      before(() => {
        url = `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter2Id}/workstreams/${fixture.projects[2].id}`
      })

      describe('as a user who is a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(teamMember.username)
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
    })
  })
})
