import faker from 'faker'
import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { turnOnSSO } from '../../../../../helpers/organisation/organisation_helper'
import {
  assertNumberOfUserRowsCorrect,
  assertRowContentsCorrect,
  assertUserCountTitleCorrect,
} from '../../../../../helpers/users/user-table-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import { avatarInitials } from '../../../../../helpers/users/user_helper'
import HttpStatus from 'http-status-codes'

const visitHelpers = new VisitHelpers()
describe('oa_organisation_create_users.cy', () => {
  let organisation, orgAdmin
  let firstName = faker.name.firstName()
  let lastName = faker.name.lastName()
  let email = faker.internet.email().toLowerCase()
  let externalEmail = faker.internet.email().toLowerCase()

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  before(() => {
    const createOrgAdmin = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
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
      createOrganisation('', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(createOrgAdmin)
        .then(associateOrgAdminWithOrg)
        .then(enableSSO)
    })
  })

  before(navigateToOrgDetail)

  describe('when click FAB to create new full user', () => {
    before(() => {
      turnOnSSO()
      cy.get('[data-test=add-people-button]').click()
    })

    it('the create user button should be disabled', () => {
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    it('should show a cancel button', () => {
      cy.get('[data-test=cancel-dialog-button]').should('have.text', 'Cancel')
    })

    it('should have the user defaulted to full', () => {
      cy.get('[data-test=internal-external-dropdown]').should(
        'have.text',
        'Full'
      )
    })

    describe('when fields filled in and click create new user', () => {
      before(() => {
        cy.get('[data-test=email]').type(`${email}{enter}`)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
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
          type: 'Full',
          status: 'Active',
        })
      })

      it('the table header should show updated counts including the created user', () => {
        assertUserCountTitleCorrect(
          'This organisation has 2 active individual accounts.'
        )
      })

      describe('when the page is refreshed', () => {
        before(() => {
          cy.reload()
          navigateToOrgDetail()
        })

        it('the created user should continue to be present with expected values', () => {
          assertNumberOfUserRowsCorrect(2)
          assertRowContentsCorrect({
            name: `${email}`,
            email: email,
            roles: '',
            type: 'Full',
            status: 'Active',
          })
        })
      })
    })

    describe('when click FAB to create new External user', () => {
      before(() => {
        cy.reload()
        navigateToOrgDetail()
        cy.get('[data-test=add-people-button]').click()
        cy.get('[data-test=email]').type(`${externalEmail}{enter}`)
        cy.get('[data-test=internal-external-dropdown]').click()
        cy.get('[role=option]').eq(1).click()

        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000) //was sometimes firing too fast
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000) //was sometimes firing too fast
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('the new user should be in the organisation list', () => {
        assertNumberOfUserRowsCorrect(3)
      })

      it('all of the columns should have expected values for the created user', () => {
        assertRowContentsCorrect({
          avatar: avatarInitials(externalEmail),
          name: externalEmail,
          email: externalEmail,
          roles: '',
          type: 'External',
          status: 'Active',
        })
      })

      it('the table header should show updated counts including the created user', () => {
        assertUserCountTitleCorrect(
          'This organisation has 3 active individual accounts.'
        )
      })

      describe('when the page is refreshed', () => {
        before(() => {
          cy.reload()
          navigateToOrgDetail()
        })

        it('the created user should continue to be present with expected values', () => {
          assertNumberOfUserRowsCorrect(3)
          assertRowContentsCorrect({
            avatar: avatarInitials(externalEmail),
            name: externalEmail,
            email: externalEmail,
            roles: '',
            type: 'External',
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
          cy.get('[data-test=email]').type('email@email.com{enter}')
        })

        it('the create button should continue to be enabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.enabled')
        })

        after(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })
      })
    })

    describe('when entering the email address of a user that already exists', () => {
      before(() => {
        navigateToOrgDetail()
        cy.get('[data-test=add-people-button]').click()
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
        cy.get('[data-test=cancel-dialog-button]').click()
      })
    })

    describe('when entering an incorrectly formatted email address', () => {
      before(() => {
        navigateToOrgDetail()
        cy.get('[data-test=add-people-button]').click()

        cy.get('[data-test=email]').type('1{enter}')
        cy.get('[role=dialog]:visible').click()
      })

      it('a validation message should be displayed to warn the user', () => {
        cy.get('[data-test=email]')
          .find('label.Mui-error')
          .should('have.text', 'Email address  is not a valid email address.')
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

    describe('when creating a user using third party provider', () => {
      before(() => {
        navigateToOrgDetail()
        cy.get('[data-test=add-people-button]').click()

        cy.get('[data-test=email]').type(
          `${faker.internet.email().toLowerCase()}{enter}`
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=radio-option-title]').eq(0).click({ force: true })
      })

      it('should display both microsoft and okta sso radio buttons', () => {
        cy.get('[data-test=radio-option-title]')
          .eq(1)
          .should('have.text', 'Microsoft SSO')
        cy.get('[data-test=radio-option-title]')
          .eq(2)
          .should('have.text', 'Okta SSO')
      })

      describe('selecting sso user', () => {
        before(() => {
          cy.get('[data-test=radio-option-title]').eq(1).click({ force: true })
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(2000)
        })

        it('should show the user created page ', () => {
          cy.get('[data-test=microsoft-user-created-text]').should('exist')
        })

        it('the new user should be in the organisation list', () => {
          assertNumberOfUserRowsCorrect(4)
        })
      })
    })
  })
})
