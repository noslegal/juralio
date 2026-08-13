import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('group_logo_api_spec', () => {
  let orgAdminUser, matterCreatorUser
  let org, group

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
              url: `${Cypress.env('serverBaseUrl')}/organisations/${
                org.id
              }/group`,
              method: 'POST',
              body: { name: 'Logo Test Group', isInternal: false },
            }).then(res => {
              group = res.body
            })
          })
        })
      })
    })
  })

  describe('When fetching a group logo with no logo set', () => {
    it('Should return BAD_REQUEST for own-org user', () => {
      cy.login(orgAdminUser)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'GET',
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('When fetching a group logo as a cross-org user', () => {
    it('Should be FORBIDDEN', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'GET',
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.FORBIDDEN,
          HttpStatus.UNAUTHORIZED,
        ])
      })
    })
  })

  describe('When setting a group logo as a matter creator (no org admin role)', () => {
    it('Should be FORBIDDEN', () => {
      cy.login(matterCreatorUser)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'POST',
        body: {},
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('When setting a group logo as a cross-org admin', () => {
    it('Should be FORBIDDEN', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'POST',
        body: {},
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.FORBIDDEN,
          HttpStatus.UNAUTHORIZED,
        ])
      })
    })
  })

  describe('When setting a group logo as own-org admin with no file', () => {
    it('Should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'POST',
        body: {},
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('When deleting a group logo as a matter creator', () => {
    it('Should be FORBIDDEN', () => {
      cy.login(matterCreatorUser)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'DELETE',
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('When deleting a group logo as a cross-org user', () => {
    it('Should be FORBIDDEN', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'DELETE',
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.FORBIDDEN,
          HttpStatus.UNAUTHORIZED,
        ])
      })
    })
  })

  describe('When deleting a group logo as own-org admin', () => {
    it('Should be allowed (no-op when no logo set)', () => {
      cy.login(orgAdminUser)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${
          org.id
        }/group/${group.id}/logo`,
        method: 'DELETE',
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
