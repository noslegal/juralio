import faker from 'faker'
import { visitGlobalUsers } from '../../../../../helpers/admin/admin_visit_helpers'
import {
  assertOrganisationName,
  assertRowContentsCorrect,
} from '../../../../../helpers/users/user-table-helper'

describe('sysadmin_global_users_create_user_out_of_context.cy', () => {
  let firstName = faker.name.firstName()
  let lastName = faker.name.lastName()
  let email = faker.internet.email().toLowerCase()
  let externalEmail = faker.internet.email().toLowerCase()

  let msEmail = faker.internet.email().toLowerCase()

  const navigateToOrg = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitGlobalUsers()
  }

  const selectJuralioOrg = () => {
    cy.get('[data-test=organisation]').click()
    cy.contains('[role=option]', /^Juralio$/).click()
  }

  before(navigateToOrg)

  describe('when click FAB to create new user', () => {
    before(() => {
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-user-flow-dialog-button]').should('be.visible')
      cy.get('[data-test=create-user-flow-dialog-button]').click({
        force: true,
      })
    })

    describe('when creating a juralio user', () => {
      describe('when creating an internal user', () => {
        it('the create user button should be disabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })

        it('should have the user defaulted to Internal', () => {
          cy.get('[data-test=internal-external-dropdown]').should(
            'have.text',
            'Full'
          )
        })

        describe('when fields filled in and click create new user', () => {
          before(() => {
            cy.get('[data-test=email]').type(`${email}{enter}`)
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=firstname]', { timeout: 15000 }).type('john')
            cy.get('[data-test=lastname]').type('doe')
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=action-dialog-button]', { timeout: 15000 }).click()
            cy.get('[data-test=action-dialog-button]', { timeout: 15000 }).click()
            cy.wait(2000)
          })

          it('all of the columns should have expected values for the created user', () => {
            assertRowContentsCorrect({
              avatar: 'jd',
              name: 'john doe',
              email: email,
              roles: '',
              type: 'Internal',
              status: 'Active',
            })
            assertOrganisationName(email, 'None')
          })

          describe('when the page is refreshed', () => {
            before(() => {
              cy.reload()
              navigateToOrg()
            })

            it('the created user should continue to be present with expected values', () => {
              assertRowContentsCorrect({
                avatar: 'jd',
                name: 'john doe',
                email: email,
                roles: '',
                type: 'Internal',
                status: 'Active',
              })
            })
          })
        })
      })

      describe('when creating an external user', () => {
        before(() => {
          cy.get('[data-test=fab-button]').click()
          cy.get('[data-test=create-user-flow-dialog-button]').should(
            'be.visible'
          )
          cy.get('[data-test=create-user-flow-dialog-button]').click({
            force: true,
          })
        })

        it('the create user button should be disabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })

        it('should have the user defaulted to Internal', () => {
          cy.get('[data-test=internal-external-dropdown]').should(
            'have.text',
            'Full'
          )
        })

        describe('when fields filled in and click create new user', () => {
          before(() => {
            cy.get('[data-test=email]').type(`${externalEmail}{enter}`)
            selectJuralioOrg()
            cy.get('[data-test=internal-external-dropdown]').click()
            cy.get('[role=option]').eq(1).click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get(
              '.MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select'
            ).click()
            cy.get('[data-test="group-selection-19"]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=firstname]').type('john')
            cy.get('[data-test=lastname]').type('doe')
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
          })

          it('all of the columns should have expected values for the created user', () => {
            assertRowContentsCorrect({
              avatar: 'jd',
              name: 'john doe (limited)',
              email: externalEmail,
              roles: '',
              type: 'External',
              status: 'Active',
            })
            assertOrganisationName(externalEmail, 'Juralio')
          })

          describe('when the page is refreshed', () => {
            before(() => {
              cy.reload()
              navigateToOrg()
            })

            it('the created user should continue to be present with expected values', () => {
              assertRowContentsCorrect({
                avatar: 'jd',
                name: 'john doe (limited)',
                email: externalEmail,
                roles: '',
                type: 'External',
                status: 'Active',
              })
            })
          })
        })
      })
    })

    describe('while ensuring an incomplete entry cannot be submitted', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-user-flow-dialog-button]').should(
          'be.visible'
        )
        cy.get('[data-test=create-user-flow-dialog-button]').click({
          force: true,
        })
      })

      it('the create button should continue to be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      describe('and subsequently adding a valid email address', () => {
        before(() => {
          cy.get('[data-test=email]').type('email@email.com{enter}')
        })

        it('the create button should continue to be enabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.enabled')
        })

        after(() => {
          cy.get('[role=dialog]:visible').type('{esc}')
        })
      })
    })

    describe('when entering the email address of a user that already exists', () => {
      before(() => {
        cy.wait(2000)
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-user-flow-dialog-button]').should(
          'be.visible'
        )
        cy.get('[data-test=create-user-flow-dialog-button]').click({
          force: true,
        })

        cy.get('[data-test=email]').type(`${email}{enter}`)
      })

      it('a validation message should be displayed to warn the user', () => {
        cy.get('[data-test=email]')
          .find('label.Mui-error')
          .should('have.text', `${email} already exists`)
      })

      it('create user button should not be enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('not.be.enabled')
      })

      after(() => {
        cy.get('[role=dialog]:visible').type('{esc}')
      })
    })

    describe('when entering an incorrectly formatted email address', () => {
      before(() => {
        cy.wait(2000)
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-user-flow-dialog-button]').should(
          'be.visible'
        )
        cy.get('[data-test=create-user-flow-dialog-button]').click({
          force: true,
        })

        cy.get('[data-test=email]').type('1{enter}')
        cy.get('[role=dialog]:visible').click()
      })

      it('create user button should be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      describe('and updating the value to a valid email address', () => {
        before(() => {
          cy.get('[data-test=email]').find('svg.MuiChip-deleteIcon').click()

          cy.get('[data-test=email]').type('a-brand-new-email@email.com{enter}')
        })

        it('create user button should be enabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.enabled')
        })
      })
    })
  })
})
