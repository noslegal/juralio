import HttpStatus from 'http-status-codes'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

let twentyDaysAgo = new Date()
twentyDaysAgo.setTime(twentyDaysAgo.getTime() - 24 * 60 * 60 * 1000 * 20)
const sampleUserList = [
  {
    id: 18318,
    username: 'carlosipes76985@juralio.com',
    firstname: 'Carlo',
    lastname: 'Sipes',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 3,
    avatarImageIndex: 15,
    mostRecentActivityTime: '2022-12-07T14:52:24Z',
    onlineNow: false,
    confirmationStatus: 'trialing',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 17730,
    username: 'leslysteuber33442@juralio.com',
    firstname: 'Lesly',
    lastname: 'Steuber',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 3,
    avatarImageIndex: 3,
    mostRecentActivityTime: '2022-12-07T14:51:29Z',
    onlineNow: false,
    confirmationStatus: 'trialing',
    trialStartDate: twentyDaysAgo.toISOString(),
  },
  {
    id: 18025,
    username: 'angelicamoen52569@juralio.com',
    firstname: 'Angelica',
    lastname: 'Moen',
    enabled: false,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 0,
    avatarImageIndex: 7,
    mostRecentActivityTime: '2022-12-07T14:51:29Z',
    onlineNow: false,
    confirmationStatus: 'lapsed',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 17439,
    username: 'osbaldoziemann20834@juralio.com',
    firstname: 'Osbaldo',
    lastname: 'Ziemann',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 3,
    avatarImageIndex: 1,
    mostRecentActivityTime: '2022-12-07T14:51:29Z',
    onlineNow: false,
    confirmationStatus: 'confirmed',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 17147,
    username: 'josuelittel81445@juralio.com',
    firstname: 'Josue',
    lastname: 'Littel',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 0,
    avatarImageIndex: 6,
    mostRecentActivityTime: '2022-12-07T14:51:30Z',
    onlineNow: false,
    confirmationStatus: 'whitelisted',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 16818,
    username: 'demarcoschultz48752@juralio.com',
    firstname: 'Demarco',
    lastname: 'Schultz',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 4,
    avatarImageIndex: 8,
    mostRecentActivityTime: '2022-12-07T14:51:30Z',
    onlineNow: false,
    confirmationStatus: 'trialing',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 16706,
    username: 'laneyhermann40232@juralio.com',
    firstname: 'Laney',
    lastname: 'Hermann',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 3,
    avatarImageIndex: 15,
    mostRecentActivityTime: '2022-12-07T14:51:30Z',
    onlineNow: false,
    confirmationStatus: 'trialing',
    trialStartDate: new Date().toISOString(),
  },
  {
    id: 16098,
    username: 'laurencole97253@juralio.com',
    firstname: 'Lauren',
    lastname: 'Cole',
    enabled: true,
    mfaEnabled: false,
    roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    isActiveOnMatter: false,
    temporaryPassword: null,
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    isExternal: false,
    organisation: { id: '16' },
    avatarColorIndex: 3,
    avatarImageIndex: 13,
    mostRecentActivityTime: '2022-12-07T14:51:31Z',
    onlineNow: false,
    confirmationStatus: 'trialing',
    trialStartDate: new Date().toISOString(),
  },
]

describe('oa_table_display_spec', () => {
  let org, user1, user2, standardUser
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('', true, false, {}, false, false, false, true).then(
      user => (user1 = user)
    )
    createUser('', true, false, {}, false, false, false, true).then(u2 => {
      user2 = u2
    })
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
      createOrganisation('', false).then(o => {
        org = o.body
        sysadminAddUserToOrganisation(o.body, user1)
        sysadminAddUserToOrganisation(o.body, user2)
      })
    })
  })
  describe('as an org admin', () => {
    describe('when viewing the org admin table when confirmation is disabled', () => {
      before(() => {
        cy.login(user1.username, 'Password2Password2$')
        visitHelpers.visitOrgUsers()
        cy.wait(5000)
        cy.get('[data-test=close-icon]', { timeout: 30000 }).click()
        cy.get('[data-test=ftueSkipButton]').click()
      })
      it('should not show the summary text', () => {
        cy.get('[data-test=confirmed-user-org-info]').should('not.exist')
      })
      it('should not show the table column', () => {
        cy.get('[data-test=user-confirmation-status-header]').should(
          'not.exist'
        )
        cy.get('[data-test=user-confirmation-status]').should('not.exist')
      })
    })

    describe('when all states are visible', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverRootBaseUrl'
          )}/api/admin/instance/settings`,
          method: 'PATCH',
          body: {
            enableUserConfirmation: true,
            enablePaymentPlatformIntegration: false,
          },
        }).then(response => {
          cy.intercept(
            {
              method: 'GET',
              url: '*/organisations/*/users',
            },
            {
              body: sampleUserList.map(u => {
                u.organisation.id = org.id
                return u
              }),
            }
          )
          cy.login(user1.username, 'Password2Password2$')
          visitHelpers.visitOrgUsers()
        })
      })
      it('should show how many days are left in the trial', () => {
        cy.get('[data-test=trialing-days-remaining-info]')
          .eq(1)
          .should('have.text', '20 days left in trial')
        cy.get('[data-test=trialing-days-remaining-info]')
          .eq(0)
          .should('have.text', '< 1 day left in trial')
      })
      it('should show the confirmed users', () => {
        cy.get('[data-test=confirmed-status-info]').should('have.length', 1)
      })
      it('should show the lapsed users', () => {
        cy.get('[data-test=lapsed-status-info]').should('have.length', 1)
      })
      it('should show the whitelisted users', () => {
        cy.get('[data-test=whitelist-status-info]').should('have.length', 1)
      })

      describe('when activating a lapsed user', () => {
        before(() => {
          cy.get('[data-test=status-select-selection-dropdown]').eq(7).click()
          cy.get('[data-test=status-select-on-option]').click()
        })
        it('should ask about confirmations', () => {
          cy.get('[data-test=seat-increase-confirmation-reactivation]').should(
            'be.visible'
          )
        })
      })
      describe('when confirming a trialing user', () => {
        before(() => {
          cy.login(user1.username, 'Password2Password2$')
          visitHelpers.visitOrgUsers()
          cy.get('[data-test=confirm-user-button]').eq(0).click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should update the user to confirmed', () => {
          cy.get('[data-test=confirmed-status-info]').should('have.length', 1)
          cy.get('[data-test=confirm-user-button]').should('have.length', 1)
        })
      })
    })
  })
})
