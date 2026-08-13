import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('user_confirmation_status.cy', () => {
  let whitelistedUser, unconfirmedUser

  const instanceSettingsURL = `${Cypress.env(
    'serverRootBaseUrl'
  )}/api/admin/instance/settings`

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: instanceSettingsURL,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
      },
    }).then(() => {
      createUser().then(createdUser => {
        whitelistedUser = createdUser
      })
      createUser().then(user => {
        unconfirmedUser = user
      })
    })
  })

  describe('when adding a user to the whitelist and enabling the instance user confirmation', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/instance/whitelist`,
        method: 'POST',
        body: { emails: [whitelistedUser.username] },
      }).then(() => {
        cy.apiSpecRequest({
          url: instanceSettingsURL,
          method: 'PATCH',
          body: {
            enableUserConfirmation: true,
          },
        })
      })
    })

    it('should set the correct confirmation statuses to existing users', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/organisations/${DEFAULT_ORGANISATION_ID}/users`,
        method: 'GET',
        body: {},
      }).then(response => {
        const whitelisted = response.body.filter(
          user =>
            user.id === whitelistedUser.id &&
            user.confirmationStatus === 'whitelisted'
        )
        const trialing = response.body.filter(
          user =>
            user.id === unconfirmedUser.id &&
            user.confirmationStatus === 'trialing'
        )
        expect(whitelisted).to.have.length(1)
        expect(trialing).to.have.length(1)
      })
    })
  })

  describe('when adding a new user that is not whitelisted', () => {
    let user
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createUser().then(createdUser => {
        user = createdUser
      })
    })

    it('they should be marked as trialing and have a trial start date', () => {
      expect(user.confirmationStatus).to.equal('trialing')
      expect(user.trialStartDate).to.not.equal(null)
    })
  })
})
