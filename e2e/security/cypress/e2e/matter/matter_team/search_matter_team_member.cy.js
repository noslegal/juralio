import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('search_matter_team_member.cy', () => {
  let teamMember, nonTeamMember, nonTeamMemberButOrgAdmin, fixture
  before(() => {
    createUser().then(() => {
      createUser(undefined, true, true, { roles: ['ROLE_USER'] }).then(
        createdUser => {
          nonTeamMember = createdUser

          createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
            createdUser => {
              nonTeamMemberButOrgAdmin = createdUser

              createUser()
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
                          tasks: [{ name: 'Task' }],
                        },
                      ],
                    },
                  }
                  fixture = generateFixture(seed)
                })
            }
          )
        }
      )
    })
  })

  describe('When searching user in a matter', () => {
    describe('where the user is NOT a matter team member', () => {
      it('should respond FORBIDDEN status code', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'POST',
          body: {
            matterId: fixture.matter.id,
            name: 'test',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('where the user is NOT a matter team member but an ORG ADMIN', () => {
      it('should respond OK status code', () => {
        cy.login(nonTeamMemberButOrgAdmin.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'POST',
          body: {
            matterId: fixture.matter.id,
            name: 'test',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('where the user is a matter team member', () => {
      it('should respond OK status code', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'POST',
          body: {
            matterId: fixture.matter.id,
            name: 'test',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
