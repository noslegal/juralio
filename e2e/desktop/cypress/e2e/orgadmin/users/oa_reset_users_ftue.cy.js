import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_reset_users_ftue.cy', () => {
  let orgAdminUser, testUser
  let fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        createdUser => {
          orgAdminUser = createdUser
          const seed = {
            matter: {
              prefix: 'directroute',
              teamMembers: [testUser],
              matterAdmins: [testUser],
              projects: [
                {
                  name: 'P1',
                },
              ],
            },
          }
          fixture = generateFixture(seed)
          appPage = getWrapper(fixture)
        }
      )
    })
  })

  describe('when choosing to reset the ftue of a user as Org Admin', () => {
    before(() => {
      cy.login(orgAdminUser.username)
      visitHelpers.visitOrgUsers()
    })

    describe('When clicking the reset link', () => {
      before(() => {
        getUserRowByUsername(testUser.username).click(0, 0)
        cy.get('[data-test=reset-ftue-tutorial-link]').click()
      })

      it('should display the snackbar.', () => {
        snackbarHelper.checkShownAndHasExpectedText('', 'Dismiss')
      })
    })
  })
})
