import { visitGlobalUsers } from '../../../../../helpers/admin/admin_visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as dialogGet } from '../../../../../page/users/user-details-dialog-page'

describe('sysadmin_global_users_change_organisation.cy', () => {
  let testUser, firstOrg, secondOrg

  const navigateToPage = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitGlobalUsers()
  }

  before(() => {
    createUser(undefined, true, false)
      .then(user => (testUser = user))
      .then(createOrganisation)
      .then(o => {
        firstOrg = o.body
        createUser('', true, false).then(u2 => {
          sysadminAddUserToOrganisation(firstOrg, u2)
          return sysadminAddUserToOrganisation(firstOrg, testUser)
        })
      })
      .then(createOrganisation)
      .then(o => {
        secondOrg = o.body
        createUser('', true, false).then(u3 => {
          sysadminAddUserToOrganisation(o.body, u3)
        })
      })
    navigateToPage()
  })

  describe('When viewing the user properties for a normal user', () => {
    before(() => {
      getUserRowByUsername(testUser.username).click()
    })

    it("the organisation drop down should display the first organisation's name", () => {
      cy.wait(500)
      dialogGet.organisationSelector().should('contains.text', firstOrg.name)
    })

    describe('When switching a normal user from the first org to the second org', () => {
      describe('When cancel is pressed', () => {
        before(() => {
          dialogGet.organisationSelector().click()
          cy.get(`[data-test=organisation-selection-${secondOrg.id}]`)
            .scrollIntoView()
            .click()
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('Reopening the properties dialog should continue to display the name of the original organisation', () => {
          getUserRowByUsername(testUser.username).click()
          dialogGet
            .organisationSelector()
            .should('contains.text', firstOrg.name)
        })
      })

      describe('When the organisation is changed', () => {
        before(() => {
          dialogGet.organisationSelector().click()

          cy.get(`[data-test=organisation-selection-${secondOrg.id}]`)
            .scrollIntoView()
            .click()
        })

        it('Shows a warning', () => {
          cy.get('[data-test=organisation-selector]').should(
            'contains.text',
            'This user may not be able to log in to their new org with their current authentication method.'
          )
        })

        describe('When continue is pressed', () => {
          before(() => {
            cy.backendRoute('/users').as('refreshUsers')
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait('@refreshUsers')
          })

          it('Reopening the properties dialog should now display the name of the new organisation', () => {
            getUserRowByUsername(testUser.username).click()
            dialogGet
              .organisationSelector()
              .should('contains.text', secondOrg.name)
          })

          describe('When the organisation is changed to None', () => {
            before(() => {
              dialogGet.organisationSelector().click()

              cy.get('[data-test=organisation-selection-none]')
                .scrollIntoView()
                .click()
            })

            it('Shows a warning', () => {
              cy.get('[data-test=organisation-selector]').should(
                'contains.text',
                'This user will not be able to access any organisations, are you sure?'
              )
            })
          })
        })
      })
    })
  })
})
