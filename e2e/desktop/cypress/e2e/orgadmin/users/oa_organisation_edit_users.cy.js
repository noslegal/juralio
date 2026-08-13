import HttpStatus from 'http-status-codes'
import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  getUniqueEmailAddress,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { turnOnSSO } from '../../../../../helpers/organisation/organisation_helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { changeUserActiveStatus } from '../../../../../helpers/users/user_helper'

const visitHelpers = new VisitHelpers()

describe(
  'oa_organisation_edit_users.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
    let organisation, standardUser, orgAdmin

    const visitOrgUsers = orgAdmin => {
      cy.login(orgAdmin.username)
      visitHelpers.visitOrgUsers()
      cy.wait(5000)
      cy.get('body').type('{esc}')
      cy.get('[data-test=ftueSkipButton]', { timeout: 3000 }).click()
    }

    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: {
          enableUserConfirmation: false,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
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

      createOrganisation('test', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(createStandardUser)
        .then(createOrgAdmin)
        .then(associateOrgAdminWithOrg)
        .then(associateStandardUserWithOrg)

        .then(enableSSO)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: {
          enablePaymentPlatformIntegration: false,
        },
      })
    })

    describe('when a user is set to inactive', () => {
      before(() => {
        visitOrgUsers(orgAdmin)
        cy.wait(1000)
        turnOnSSO()
      })

      describe('when a new user is created', () => {
        let userEmail

        before(() => {
          userEmail = getUniqueEmailAddress()

          cy.wait(2000)
          cy.get('[data-test=add-people-button]').click({
            timeout: 10000,
          })
          cy.get('[data-test=email]').type(`${userEmail}{enter}`)
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

        it('should be in the organisation user list', () => {
          getUserRowByUsername(userEmail).should('be.visible')
        })

        describe('when a user is set to inactive and edited', () => {
          before(() => {
            changeUserActiveStatus(standardUser)
            cy.wait(3000) // DOM disconnect
            getUserRowByUsername(standardUser.username).click('bottom')
            cy.wait(5000)
            cy.get('[data-test=first-name-field] input')
              .clear()
              .type('I am inactive ')
            cy.get('[data-test=last-name-field] input')
              .clear()
              .type('and was edited')
            cy.get('[data-test=org-admin-checkbox]').click()
            cy.get('[data-test=matter-creator-checkbox]').click()
            cy.get('[data-test=knowledge-manager-checkbox]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
          })

          it('should reflect the changes in the organisation user list', () => {
            getUserRowByUsername(standardUser.username).should('be.visible')
            getUserRowByUsername(standardUser.username)
              .find('[data-test=user-name-text]')
              .should('contain.text', 'I am inactive and was edited')
            getUserRowByUsername(standardUser.username)
              .find('[data-test=user-roles]')
              .should(
                'contains.text',
                'Knowledge manager, Matter creator, Org admin'
              )
          })
        })

        describe('when a user is set to active and edited', () => {
          before(() => {
            changeUserActiveStatus(standardUser, 'on')
            cy.wait(3000) // DOM disconnect
            getUserRowByUsername(standardUser.username).click('bottom')
            cy.wait(2001)

            cy.get('[data-test=first-name-field] input')
              .clear()
              .type('I am active ')
            cy.get('[data-test=last-name-field] input')
              .clear()
              .type('and was changed')
            cy.get('[data-test=org-admin-checkbox]').click()
            cy.wait(2000)
            cy.get('[data-test=matter-creator-checkbox]').click()
            cy.wait(2000)
            cy.get('[data-test=knowledge-manager-checkbox]').click()
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
          })

          it('should reflect the changes in the organisation user list', () => {
            getUserRowByUsername(standardUser.username).should('be.visible')
            getUserRowByUsername(standardUser.username)
              .find('[data-test=user-name-text]')
              .should('have.text', 'I am active and was changed')
            getUserRowByUsername(standardUser.username)
              .find('[data-test=user-roles]')
              .should('have.text', 'N/A')
          })
        })
      })
    })
  }
)
