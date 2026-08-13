import faker from 'faker'
import {
  visitOrganisationDetail,
  visitOrganisations,
} from '../../../../../../helpers/admin/admin_visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../../helpers/organisation/organisation_api_helper'
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
} from '../../../../../../helpers/users/user-dialog-helper'
import {
  assertNumberOfUserRowsCorrect,
  assertRowContentsCorrect,
  assertTableHeadersCorrect,
  constructAvatarText,
  launchDialogByUsername,
} from '../../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import { get as dialogGet } from '../../../../../../page/users/user-details-dialog-page'
import HttpStatus from 'http-status-codes'

describe('sa_organisation_detail.cy', () => {
  let organisation, standardUser, orgAdmin

  const navigateToGlobalList = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitOrganisations()
  }

  const navigateToOrgDetail = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitOrganisationDetail(organisation.name)
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const createOrgAdmin = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
        enablePaymentPlatformIntegration: false,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
      createOrganisation()
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(createStandardUser)
        .then(createOrgAdmin)
        .then(associateStandardUserWithOrg)
        .then(associateOrgAdminWithOrg)
    })
  })

  before(navigateToGlobalList)

  describe('when clicking on the name of an org within the global org list', () => {
    before(() => {
      cy.get('[data-test=organisation-name]')
        .contains(organisation.name)
        .click()
    })

    it('should navigate to the organisation detail page for the selected org', () => {
      cy.get('[data-test=organisation-detail]').should('be.visible')
    })

    describe('the table of users', () => {
      before(navigateToOrgDetail)

      it('should have a header displaying the number of users in the Organisation', () => {
        cy.get('[data-test=user-count-summary]').should(
          'contains.text',
          '2 active individual accounts'
        )
      })

      it('should have the expected headers', () => {
        assertTableHeadersCorrect(false)
      })

      it('should display the expected number of user rows', () => {
        assertNumberOfUserRowsCorrect(2)
      })

      it('should have the expected cell data for the standard user', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(standardUser),
          name: `${standardUser.firstname} ${standardUser.lastname}`,
          email: standardUser.username,
          roles: '',
          type: 'Internal',
          status: 'Active',
        })
      })

      it('should have the expected cell data for the org admin', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(orgAdmin),
          name: `${orgAdmin.firstname} ${orgAdmin.lastname}`,
          email: orgAdmin.username,
          roles: 'Org admin',
          type: 'Internal',
          status: 'Active',
        })
      })

      describe('When clicking on the back to organisation list', () => {
        before(() => {
          cy.get('[data-test=back-to-list-button]').click()
        })
        it('should show the organisations list', () => {
          cy.get('[data-test=organisations-content]').should('be.visible')
        })
      })
    })

    describe('when clicking a row within the table', () => {
      before(() => {
        navigateToOrgDetail()
        launchDialogByUsername(orgAdmin.username)
      })

      it('the edit user dialog should appear and display the expected user details', () => {
        assertDialogContentsCorrect(orgAdmin, organisation)
        assertCheckedRolesCorrect(orgAdmin.roles)
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
              avatar: constructAvatarText(updatedProperties),
              name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
              email: orgAdmin.username,
              roles: 'Matter creator, Org admin',
              type: 'Internal',
              status: 'Active',
            })
          })

          describe('and refreshing the page', () => {
            before(navigateToOrgDetail)

            it('should continue to show the updated properties for the user', () => {
              assertRowContentsCorrect({
                avatar: constructAvatarText(updatedProperties),
                name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
                email: orgAdmin.username,
                roles: 'Matter creator, Org admin',
                type: 'Internal',
                status: 'Active',
              })
            })
          })

          describe('and making a further change to revoke a role', () => {
            before(navigateToOrgDetail)
            before(() => {
              launchDialogByUsername(orgAdmin.username)
              uncheckMatterCreatorRole()
              dialogGet.saveButton().click()
            })

            it('should reflect the revoked role in the table', () => {
              assertRowContentsCorrect({
                avatar: constructAvatarText(updatedProperties),
                name: `${updatedProperties.firstname} ${updatedProperties.lastname}`,
                email: orgAdmin.username,
                roles: 'Org admin',
                type: 'Internal',
                status: 'Active',
              })
            })
          })
        })

        describe('and entering incomplete name information', () => {
          before(() => {
            launchDialogByUsername(orgAdmin.username)
          })

          it('validation should prevent submission', () => {
            assertRequiredValidationBlocksSubmission()
          })
        })
      })
    })
  })
})
