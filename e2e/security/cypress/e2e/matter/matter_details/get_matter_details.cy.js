import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_matter_details.cy', () => {
  let user, user2, fixture
  before(() => {
    createUser().then(u => {
      createUser().then(createdUser => {
        user = createdUser
        createUser('user', true, true, { roles: ['ROLE_USER'] }).then(
          createdUser2 => {
            user2 = createdUser2
            const seed = {
              matter: {
                prefix: 'importantMatter',
                teamMembers: [user],
                matterAdmins: [user],
                projects: [
                  {
                    name: 'Project 1',
                    tasks: [{ name: 'Happy' }],
                  },
                  {
                    name: 'Project 2',
                    tasks: [{ name: 'Halloween' }],
                  },
                ],
              },
            }
            fixture = generateFixture(seed)
          }
        )
      })
    })
  })

  describe('when trying to list matter details ', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to list matter details ', () => {
    describe('when not a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe("for a matter that doesn't exist", () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/-1`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
