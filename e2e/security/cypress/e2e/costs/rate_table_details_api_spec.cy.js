import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('rate_table_details_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org
  //set up
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
  describe('when trying to create a rate table detail when not an org admin', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: matterCreatorUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
      })
    })
    it('Should not be allowed to create a period', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a rate table detail as an org admin with a bad payload', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: orgAdminUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
      })
    })
    it('should not be allowed with a BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
        method: 'POST',
        body: {
          currency: null,
          work_type: 'Example',
          location: 'E2E',
          client: false,
          draft: false,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('When trying to create a rate table detail as an org admin with a good payload', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: orgAdminUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
      })
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisorPosition = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
            method: 'POST',
            body: {
              currency: 'GBP',
              work_type: 'Example',
              location: 'E2E',
              client: false,
              draft: false,
              position: advisorPosition?.id,
            },
          }).then(res => {
            expect(res.status).to.eq(200)
          })
        })
    })
  })

  describe('When listing rate table details (show) as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rate_table_details`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When listing rate table details (show) as an org admin', () => {
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
            url: `${Cypress.env('serverBaseUrl')}/rate_table_details`,
            method: 'POST',
            body: { position: advisorPosition?.id },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(200)
          })
        })
    })
  })
})
