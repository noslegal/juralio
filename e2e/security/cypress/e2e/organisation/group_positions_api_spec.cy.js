import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('group_positions_api_spec', () => {
  let orgAdminUser, matterCreatorUser
  let org

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

  describe('When fetching group positions as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When fetching group positions as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When fetching group positions as a sysadmin', () => {
    it('Should not be allowed', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
})
