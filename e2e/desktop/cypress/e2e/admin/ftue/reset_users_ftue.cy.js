import { visitGlobalUsers } from '../../../../../helpers/admin/admin_visit_helpers'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('reset_users_ftue.cy', () => {
  let testUser, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
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
    })
  })

  describe('when choosing to reset the ftue of a user as sysadmin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitGlobalUsers()
    })

    describe('When clicking the reset link', () => {
      before(() => {
        getUserRowByUsername(testUser.username).click()
        cy.get('[data-test=reset-ftue-tutorial-link]').click()
      })

      snackbarHelper.checkShownAndHasExpectedText(
        'Done! The reset will take effect upon next login.'
      )
    })

    describe('when visiting the task map as the user with the reset ftue', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTaskMap()
      })

      it('should display the taskmap FTUE', () => {
        cy.get('[data-test=taskmap-ftue]').should('be.visible')
      })
    })
  })
})
