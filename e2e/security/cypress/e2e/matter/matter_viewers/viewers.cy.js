import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../../helpers/users/user_api_helper'

describe('viewers.cy', () => {
  let user, user2, fixture
  before(() => {
    createUser('other user', undefined, false).then((createdUser) => {
      user2 = createdUser
      createUser('', true, true, { roles: ['ROLE_ORG_OWNER'] }).then(
        (createdUser) => {
          user = createdUser

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
          sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
        }
      )
    })
  })

  describe('when send POST request', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}`,
          method: 'GET',
        }).then((response) => {
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
        }).then((response) => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('for a matter that doesn\'t exist', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/-1`,
          method: 'GET',
        }).then((response) => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
