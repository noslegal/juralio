import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../../helpers/users/user_api_helper'

describe('notify_new_matter_team_members.cy', () => {
  let user, user2, user3, fixture
  before(() => {
    createUser('', true, true).then(createdUser => {
      user3 = createdUser
      createUser('', true, false).then(createdUser => {
        user2 = createdUser
        sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
        createUser('', true, true).then(createdUser => {
          user = createdUser

          const seed = {
            matter: {
              prefix: 'importantMatter',
              teamMembers: [user, user2, user3],
              matterAdmins: [user, user3],
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
        })
      })
    })
  })

  describe('when trying to notify a new matter admin', () => {
    describe('as a MATTER ADMIN', () => {
      before(() => {
        // addMatterAdmin(fixture.matter.id, user.id).then(res => {
        //   console.log(res)
        // })
        cy.login(user3.username)
      })

      it('should return OK status for a POST', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/notify`,
          method: 'POST',
          body: {
            message: 'test',
            users: [user2.id],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to notify a new matter admin', () => {
    describe('when not a MATTER_ADMIN', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return FORBIDDEN status for a POST', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/notify`,
          method: 'POST',
          body: {
            message: 'test',
            users: [user2.id],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
