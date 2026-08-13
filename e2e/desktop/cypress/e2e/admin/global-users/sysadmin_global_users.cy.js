import faker from 'faker'
import {
  visitGlobalUsers,
  visitHome,
} from '../../../../../helpers/admin/admin_visit_helpers'
import {
  assertAvatarTextCorrect,
  assertCheckedRolesCorrect,
  assertDialogContentsCorrect,
  assertRequiredValidationBlocksSubmission,
  checkMatterCreatorRole,
  checkOrgAdminRole,
  enterFirstname,
  enterLastname,
  uncheckMatterCreatorRole,
} from '../../../../../helpers/users/user-dialog-helper'
import {
  assertRowContentsCorrect,
  assertTableHeadersCorrect,
  assertUserCountTitleCorrect,
  constructAvatarText,
  launchDialogByUsername,
} from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as dialogGet } from '../../../../../page/users/user-details-dialog-page'

describe('sysadmin_global_users.cy', () => {
  let testOrgAdmin

  const navigateToPage = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitGlobalUsers()
  }

  before(() => {
    createUser(undefined, false, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
      user => {
        testOrgAdmin = user
      }
    )
  })
  before(navigateToPage)

  describe('when navigating away from the page and returning', () => {
    before(() => {
      navigateToPage()
      visitHome()
      visitGlobalUsers()
    })
  })

  describe('the table of users', () => {
    it('should have a page title "All users"', () => {
      cy.wait(3000)
      cy.get('[data-test=table-title]').should('contain', 'All accounts')
    })

    it('should have a header displaying the number of users in the system', () => {
      assertUserCountTitleCorrect('This instance has')
      assertUserCountTitleCorrect('active individual accounts.')
      assertUserCountTitleCorrect('This organisation has used')
    })

    it('should have the expected headers', () => {
      assertTableHeadersCorrect()
    })

    it('should have the expected cell data for an org admin', () => {
      assertRowContentsCorrect({
        avatar: constructAvatarText(testOrgAdmin),
        name: `${testOrgAdmin.firstname} ${testOrgAdmin.lastname}`,
        email: testOrgAdmin.username,
        roles: 'Org admin',
        type: 'Internal',
        status: 'Active',
        statusEnabled: true,
      })
    })
  })

  describe('when clicking a row within the table', () => {
    let userToEdit

    before(() => {
      createUser(undefined, true, false).then(response => {
        userToEdit = response
        navigateToPage()
        cy.reload()
        visitGlobalUsers()
        launchDialogByUsername(userToEdit.username)
      })
    })

    it('the edit user dialog should appear and display the expected user details', () => {
      assertDialogContentsCorrect(userToEdit)
      assertCheckedRolesCorrect(userToEdit.roles)
    })

    describe('and choosing to edit the details of a user', () => {
      const updatedProperties = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
      }

      before(() => {
        enterFirstname(updatedProperties.firstname)
        enterLastname(updatedProperties.lastname)
        checkOrgAdminRole()
        checkMatterCreatorRole()
      })

      it('the avatar text should be updated', () => {
        assertAvatarTextCorrect(updatedProperties)
      })

      describe('when choosing to submit the changes', () => {
        before(() => {
          dialogGet.saveButton().click()
        })

        it('the dialog should be closed', () => {
          dialogGet.dialog().should('not.exist')
        })

        it('should update the user record in the table', () => {
          assertRowContentsCorrect({
            name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
            email: userToEdit.username,
            roles: 'Matter creator, Org admin',
            type: 'Internal',
            status: 'Active',
          })
        })

        describe('and refreshing the page', () => {
          before(navigateToPage)

          it('should continue to show the updated properties for the user', () => {
            assertRowContentsCorrect({
              name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
              email: userToEdit.username,
              roles: 'Matter creator, Org admin',
              type: 'Internal',
              status: 'Active',
            })
          })
        })

        describe('and making a further change to revoke a role', () => {
          before(navigateToPage)
          before(() => {
            launchDialogByUsername(userToEdit.username)
            uncheckMatterCreatorRole()
            dialogGet.saveButton().click()
          })

          it('should reflect the revoked role in the table', () => {
            assertRowContentsCorrect({
              name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
              email: userToEdit.username,
              roles: 'Org admin',
              type: 'Internal',
              status: 'Active',
            })
          })
        })
      })

      describe('and entering incomplete name information', () => {
        before(() => {
          launchDialogByUsername(userToEdit.username)
        })

        it('validation should prevent submission', () => {
          assertRequiredValidationBlocksSubmission()
        })
      })
    })
  })
})
