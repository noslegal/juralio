import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('rate_type_api_spec', () => {
  let orgAdminUser, matterCreatorUser
  let org, rateType

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
        })
      })
    })
  })

  describe('When generating default rate types as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${
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

  describe('When generating default rate types as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisorPosition = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/rate_type/${
              org.id
            }/generateDefaults`,
            method: 'POST',
            body: { position: advisorPosition?.id },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(200)
          })
        })
    })
  })

  describe('When generating default rate types for another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${
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

  describe('When listing rate types as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When listing rate types as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisorPosition = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/rate_type`,
            method: 'POST',
            body: { position: advisorPosition?.id },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(200)
          })
        })
    })
  })

  describe('When creating a rate type as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_types`,
        method: 'POST',
        body: { name: 'security test rate type' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When creating a rate type as an org admin with bad payload', () => {
    it('Should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_types`,
        method: 'POST',
        body: { name: '' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('When creating a rate type as an org admin with valid payload', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisorPosition = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/rate_types`,
            method: 'POST',
            body: {
              name: 'sec test rate type',
              position: advisorPosition?.id,
            },
            failOnStatusCode: false,
          }).then(res => {
            rateType = res.body
            expect(res.status).to.eq(200)
          })
        })
    })
  })

  describe('When updating a rate type as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${rateType.id}`,
        method: 'PATCH',
        body: { name: 'updated' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When updating a rate type as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${rateType.id}`,
        method: 'PATCH',
        body: { name: 'updated' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When deleting a rate type as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${rateType.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When deleting a rate type as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_type/${rateType.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
