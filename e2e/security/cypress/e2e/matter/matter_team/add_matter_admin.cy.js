import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser, DEFAULT_ORGANISATION_ID } from '../../../../../helpers/users/user_api_helper'


describe('add_matter_admin.cy', () => {
  let user, user2, user3, fixture
  before(() => {
    createUser().then(createdUser => {
      user3 = createdUser
      createUser(undefined, true, false).then(createdUser => {
        user2 = createdUser
        sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
        createUser().then(createdUser => {
          user = createdUser

          const seed = {
            matter: {
              prefix: 'importantMatter',
              teamMembers: [user, user2, user3],
              matterAdmins: [user],
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

  describe('when trying to add a new matter admin', () => {
    describe('as a MATTER ADMIN', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status for a POST', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters`,
          method: 'POST',
          body: {
            matter: fixture.matter.id,
            user: user3.id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to add a new matter admin', () => {
    describe('when not a MATTER_ADMIN', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return FORBIDDEN status for a POST', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters`,
          method: 'POST',
          body: {
            matter: fixture.matter.id,
            user: user2.id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
