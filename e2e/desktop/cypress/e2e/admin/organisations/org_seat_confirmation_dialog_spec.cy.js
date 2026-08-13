import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import HttpStatus from 'http-status-codes'

describe('org_seat_confirmation_dialog_spec', () => {
  let organisation,
    users = { 0: null, 1: null, 2: null, 3: null }
  const visitHelpers = new VisitHelpers()

  // The accounts list is returned in a non-deterministic order and rows can
  // re-order as users are confirmed/enabled/disabled, so we target rows by the
  // user's name rather than by positional index.
  const rowFor = user =>
    cy.contains(
      '[data-test=user-list-item]',
      `${user.firstname} ${user.lastname}`
    )

  const reloadAccounts = () => {
    cy.login(users[3])
    visitHelpers.visitOrganisation()
    cy.get('[data-test=summary-of-accounts]', { timeout: 30000 }).should(
      'be.visible'
    )
  }

  // Stages a confirmation-status change for the user (shows the change dialog).
  const stageConfirm = user => {
    rowFor(user).find('[data-test=confirm-user-button]').click()
  }

  // Stages an enabled-status change for the user (shows the change dialog).
  const stageStatus = (user, optionTest) => {
    rowFor(user).find('[data-test=status-select-selection-dropdown]').click()
    cy.get(`[data-test=${optionTest}]`).should('be.visible').click()
  }

  // Commits the staged change shown in the dialog and waits for it to persist.
  // Both confirmation-status and enabled-status changes are committed via
  // PATCH /users/{id} (the confirm button stages two properties, so the dialog
  // commits through update() rather than the dedicated confirm endpoint).
  const commitChange = () => {
    cy.backendRoute('PATCH', '/users/*').as('commitChange')
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@commitChange')
  }

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: true,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
      createOrganisation('', false).then(res => {
        organisation = res.body
        createUser('Z', true, false).then(u => {
          //hanlde org owner
          sysadminAddUserToOrganisation(organisation, u)
        })
        Object.keys(users).map(i => {
          createUser(`${i}`, true, false, {
            roles: ['ROLE_ORG_ADMIN'],
          }).then(u => {
            users[i] = u
            sysadminAddUserToOrganisation(organisation, u)
          })
        })
      })
    })
  })

  // enableUserConfirmation is an instance-wide setting; reset it so it does not
  // leak into other specs (e.g. the home masonry trialing-user card).
  after(() => {
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
  })
  describe('when visiting the org users page', () => {
    before(() => {
      cy.login(users[3])
      visitHelpers.visitOrganisation()
      cy.get('[data-test=close-icon]').click()
      cy.get('[data-test=ftueSkipButton]').click()
      cy.wait(1000)
    })
    it('test', () => {
      cy.get('[data-test=summary-of-accounts]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
    describe('when confirming a user (seat increase)', () => {
      before(() => {
        stageConfirm(users[0])
      })
      it('should show the seat increase confirmation dialog', () => {
        cy.get('[data-test=action-dialog-button]').should('be.visible')
      })
      describe('when deactivating a user', () => {
        before(() => {
          commitChange()
          reloadAccounts()
          stageStatus(users[1], 'status-select-off-option')
        })
        it('should show the deactivate confirmation dialog', () => {
          cy.get('[data-test=action-dialog-button]').should('be.visible')
        })

        describe('when confirming a user (no increase)', () => {
          before(() => {
            commitChange()
            reloadAccounts()
            stageConfirm(users[2])
          })
          it('should show the seat fill confirmation dialog', () => {
            cy.get('[data-test=action-dialog-button]').should('be.visible')
          })
        })
        describe('when reactivating a user (seat increase)', () => {
          before(() => {
            commitChange()
            reloadAccounts()
            stageStatus(users[1], 'status-select-on-option')
          })
          it('should show the seat increase reactivation confirmation dialog', () => {
            cy.get('[data-test=action-dialog-button]').should('be.visible')
          })
          describe('when reactivating a user (no increase)', () => {
            before(() => {
              commitChange()
              reloadAccounts()
              stageStatus(users[2], 'status-select-off-option')
              commitChange()
              reloadAccounts()
              stageStatus(users[2], 'status-select-on-option')
            })
            it('should show the seat increase reactivation confirmation dialog', () => {
              cy.get('[data-test=action-dialog-button]').should('be.visible')
            })
          })
        })
      })
    })
  })
})
