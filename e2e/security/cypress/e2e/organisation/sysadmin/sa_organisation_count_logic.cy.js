import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
  MATTER_CREATOR_ID,
} from '../../../../../helpers/users/user_api_helper'

const USER = {
  SYSADMIN_USER: {
    username: 'sysadmin@juralio.com',
    password: 'Password1Password1$',
  },
  STANDARD_USER: {
    username: 'matter.creator@juralio.com',
    password: 'Password2Password2$',
  },
}

let org = null
let user1 = null
let user2 = null
let user3 = null

const getConfirmedUserCount = (orgId, expectedCount) => {
  const URL = `organisations/${orgId}`
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/${URL}`,
    method: 'GET',
    body: {},
  }).then(response => {
    expect(response.status).to.eq(HttpStatus.OK)
    expect(response.body.confirmedUserCount).to.eq(expectedCount)
  })
}

const disableUser = (
  adminUsername,
  adminPassword,
  targetUser,
  enabled = false
) =>
  cy.login(adminUsername, adminPassword).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/users/${targetUser.id}`,
        method: 'PATCH',
        body: { enabled },
      })
      .its('body')
      .then(user => user)
  )

describe('sa organisation count logic', () => {
  before('as a sysadmin create new org', () => {
    cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enableUserConfirmation: true,
      },
    })
    createOrganisation().then(newOrg => {
      org = newOrg.body
      createUser('', false, false).then(newUser => {
        user1 = newUser
        sysadminAddUserToOrganisation(org, newUser)
      })
    })
  })
  describe('After the org has been created', () => {
    before(() => {
      console.log(org)
    })

    it('Org should have confirmed user count = 0', () => {
      getConfirmedUserCount(org?.id, 0)
    })
  })

  describe('When a user is confirmed', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      const URL = `organisations/${org.id}/user/${user1.id}/confirm`

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('Org should have confirmed user count = 1', () => {
      getConfirmedUserCount(org.id, 1)
    })
  })

  describe('When confirming a user after disabling another confirmed user', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser('', false, false).then(newUser => {
        user2 = newUser
        sysadminAddUserToOrganisation(org, newUser)
        const URL1 = `organisations/${org.id}/user/${user2.id}/confirm`

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL1}`,
          method: 'POST',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })

        disableUser(
          USER.SYSADMIN_USER.username,
          USER.SYSADMIN_USER.password,
          user2
        )

        createUser('', false, false).then(newUser => {
          user3 = newUser
          sysadminAddUserToOrganisation(org, newUser)
          const URL2 = `organisations/${org.id}/user/${user3.id}/confirm`

          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL2}`,
            method: 'POST',
            body: {},
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })
    it('Should update the confirmed user count = 2', () => {
      getConfirmedUserCount(org.id, 2)
    })
  })

  describe('When enabling a deactivated confirmed user', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)

      disableUser(
        USER.SYSADMIN_USER.username,
        USER.SYSADMIN_USER.password,
        user2,
        true
      )

      const URL = `organisations/${org.id}/user/${user3.id}/confirm`

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('Should keep the confirmed count to = 3', () => {
      getConfirmedUserCount(org.id, 3)
    })
  })
})
