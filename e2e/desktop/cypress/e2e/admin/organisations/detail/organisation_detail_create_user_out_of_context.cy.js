import faker from 'faker'
import { visitOrganisationDetail } from '../../../../../../helpers/admin/admin_visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../../helpers/organisation/organisation_api_helper'
import {
  assertNumberOfUserRowsCorrect,
  assertRowContentsCorrect,
  assertUserCountTitleCorrect,
} from '../../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import { avatarInitials } from '../../../../../../helpers/users/user_helper'
import { wrapInput } from '../../../../../../page/wrapper/text-field-wrapper'
import HttpStatus from 'http-status-codes'

describe('organisation_detail_create_user_out_of_context.cy', () => {
  let organisation, standardUser
  let firstName = faker.name.firstName()
  let lastName = faker.name.lastName()
  let email = faker.internet.email().toLowerCase()

  const NAME_AT_LIMIT = '12345678901234567890123456789012345'

  const getFirstNameInput = () =>
    wrapInput(() => cy.get('[data-test=first-name]'))
  const getLastNameInput = () =>
    wrapInput(() => cy.get('[data-test=last-name]'))

  const navigateToOrg = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitOrganisationDetail(organisation.name)
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)

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
        .then(associateStandardUserWithOrg)
    })
  })

  before(navigateToOrg)

  describe('when click FAB to create new user', () => {
    before(() => {
      cy.get('[data-test=add-people-button]').click()
    })

    it('the create user button should be disabled', () => {
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    describe('when fields filled in and click create new user', () => {
      before(() => {
        cy.get('[data-test=email]').type(`${email}{enter}`)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)

        cy.get('[data-test=action-dialog-button]').click()
      })

      it('the new user should be in the organisation list', () => {
        assertNumberOfUserRowsCorrect(2)
      })

      it('all of the columns should have expected values for the created user', () => {
        assertRowContentsCorrect({
          avatar: avatarInitials(email),
          name: `${email}`,
          email: email,
          roles: '',
          type: 'Internal',
          status: 'Active',
        })
      })

      it('the table header should show updated counts including the created user', () => {
        assertUserCountTitleCorrect(
          'This organisation has 2 active individual accounts. This organisation has used 2 full seats'
        )
      })

      describe('when the page is refreshed', () => {
        before(() => {
          cy.reload()
          navigateToOrg()
        })

        it('the created user should continue to be present with expected values', () => {
          assertNumberOfUserRowsCorrect(2)
          assertRowContentsCorrect({
            avatar: avatarInitials(email),
            name: `${email}`,
            email: email,
            roles: '',
            type: 'Internal',
            status: 'Active',
          })
        })
      })
    })

    describe('while ensuring an incomplete entry cannot be submitted', () => {
      before(() => {
        cy.get('[data-test=add-people-button]').click()
      })

      describe('and subsequently adding a valid email address', () => {
        before(() => {
          cy.get('[data-test=email]').type(`${'email@email.com'}{enter}`)
        })

        it('the create button should continue to be enabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.enabled')
        })

        after(() => {
          cy.get('[data-test=cancel-dialog-button]').type('{esc}')
        })
      })
    })

    describe('when entering the email address of a user that already exists', () => {
      before(() => {
        cy.get('[data-test=add-people-button]').click()
        cy.get('[data-test=email]').type(`${email}{enter}`)
      })

      it('a validation message should be displayed to warn the user', () => {
        cy.get('[data-test=email]')
          .find('label.Mui-error')
          .should('have.text', `${email} already exists`)
      })

      it('create user button should not  be enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('not.be.enabled')
      })

      after(() => {
        cy.get('[data-test=cancel-dialog-button]').type('{esc}')
      })
    })

    describe('when entering an incorrectly formatted email address', () => {
      before(() => {
        cy.get('[data-test=add-people-button]').click()
        cy.get('[data-test=email]').type('1')
        cy.get('[role=dialog]:visible').click()
      })

      it('a validation message should be displayed to warn the user', () => {
        cy.get('[data-test=email]')
          .find('label.Mui-error')
          .should('have.text', 'Email address 1 is not a valid email address.')
      })

      it('create user button should be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      describe('and updating the value to a valid email address', () => {
        before(() => {
          cy.get('[data-test=email]')
            .type('{backspace}')
            .type('a-brand-new-email-1@email.com{enter}')
        })

        it('create user button should be enabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.enabled')
        })
      })
    })

    describe('when entering a name over the limit', () => {
      before(() => {
        cy.get('[data-test=email]').find('svg.MuiChip-deleteIcon').click()
        cy.get('[data-test=email]').type(
          'thisisatotallyuniqueemail@uniqueness.com{enter}'
        )
      })

      it('the create user button should be enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.enabled')
      })
    })
  })
})
