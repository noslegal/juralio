import HttpStatus from 'http-status-codes'
import { createOrganisation, sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser, DEFAULT_ORGANISATION_ID,  MATTER_CREATOR_ID } from '../../../../../helpers/users/user_api_helper'

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

const getTrialCardMessage = (orgId, expectedMessage) => {
  const URL = `organisations/${orgId}/trialmessage`
  cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/${URL}`,
    method: 'GET',
    body: {},
  }).then(response => {
    expect(response.status).to.eq(HttpStatus.OK)
    expect(response.body.trialMessage).to.eq(expectedMessage)
  })

}
 
const getLapsedLoginMessage = (orgId, expectedMessage) => {
  const URL = `organisations/${orgId}/lapsedloginmessage`

  cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/${URL}`,
    method: 'GET',
    body: {},
  }).then(response => {
    expect(response.status).to.eq(HttpStatus.OK)
    expect(response.body.lapsedLoginMessage).to.eq(expectedMessage)
  })
}

describe('sa organisation custom messages test',()=>{
before('as a sysadmin create new org',()=>{
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

    it('Org trial card message and lapsed login message should be blank', () => {
      getTrialCardMessage(org?.id, null)
      cy.wait(3000)
      getLapsedLoginMessage(org?.id, null)
    })
  })

  describe('When writing custom messages',()=>{
    before(()=>{
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
        const URL = `organisations/${org.id}/trialmessage`
        const testMessage = "Trial Card Test"
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {
            "trialMessage": testMessage
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
      it('Trial card message should be "Trial Card Test"', () => {
        getTrialCardMessage(org.id, "Trial Card Test")
      })

      before(()=>{
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
          const URL = `organisations/${org.id}/lapsedloginmessage`
          const testMessage = "Lapsed Login Test"
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'POST',
            body: {
              "lapsedLoginMessage": testMessage
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
        it('Trial card message should be "Lapsed Login Test"', () => {
          cy.wait(3000)
          getLapsedLoginMessage(org.id, "Lapsed Login Test")
        })
      
  })

  describe('When updating custom messages',()=>{
    before(()=>{
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
        const URL = `organisations/${org.id}/trialmessage`
        const testMessage = "Trial Card Test 2"
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            "trialMessage": testMessage
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('Trial card message should be "Trial Card Test 2"', () => {
        getTrialCardMessage(org.id, "Trial Card Test 2")
      })

      before(()=>{
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
          const URL = `organisations/${org.id}/lapsedloginmessage`
          const testMessage = "Lapsed Login Test 2"
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'PATCH',
            body: {
              "lapsedLoginMessage": testMessage
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
        it('Trial card message should be "Lapsed Login Test 2"', () => {
          getLapsedLoginMessage(org.id, "Lapsed Login Test 2")
        })
      
  })
})
