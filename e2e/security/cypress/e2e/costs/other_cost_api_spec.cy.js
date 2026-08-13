import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('other_cost_api_spec', () => {
  let orgAdminUser, matterCreatorUser
  let org, otherCost
  let advisorPosition

  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
          cy.login(orgAdminUser).then(() => {
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
              method: 'GET',
            })
              .its('body')
              .then(positions => {
                advisorPosition = positions.find(p => p.name === 'Advisor')?.id
              })
          })
        })
      })
    })
  })

  describe('When generating default other costs as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts/${
          org.id
        }/generateDefaults`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When generating default other costs as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts/${
          org.id
        }/generateDefaults`,
        method: 'POST',
        body: { position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When generating default other costs for another org', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts/${
          org.id
        }/generateDefaults`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When listing other costs as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When listing other costs as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost`,
        method: 'POST',
        body: { position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When creating an other cost as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts`,
        method: 'POST',
        body: { name: 'security test other cost' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When creating an other cost as an org admin with bad payload', () => {
    it('Should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts`,
        method: 'POST',
        // An empty body has no valid params, which the validator rejects with a
        // 403 — send an (invalid) empty name so it reaches the BAD_REQUEST path.
        body: { name: '' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('When creating an other cost as an org admin with valid payload', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCosts`,
        method: 'POST',
        body: { name: 'sec other cost', position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        otherCost = res.body
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When updating an other cost as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost/${otherCost.id}`,
        method: 'PATCH',
        body: { name: 'updated' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When updating an other cost as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost/${otherCost.id}`,
        method: 'PATCH',
        body: { name: 'updated' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When deleting an other cost as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost/${otherCost.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When deleting an other cost as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/otherCost/${otherCost.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
