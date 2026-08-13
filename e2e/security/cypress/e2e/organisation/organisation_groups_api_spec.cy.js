import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('organisation_groups_api_spec', () => {
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
        })
      })
    })
  })

  describe('When listing all groups (sysadmin only) as an org admin', () => {
    it('Should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groups`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When listing all groups (sysadmin only) as a sysadmin', () => {
    it('Should be allowed', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groups`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When listing all groups (sysadmin only) as a cross-org user', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/groups`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When creating a group as an org admin', () => {
    it('Should be allowed with valid payload', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group`,
        method: 'POST',
        body: { name: 'Security Test Group', isInternal: false },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        group = res.body
      })
    })
  })

  describe('When creating a group as an org admin with missing name', () => {
    it('Should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group`,
        method: 'POST',
        body: { isInternal: false },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('When creating a group in another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group`,
        method: 'POST',
        body: { name: 'Hostile Group', isInternal: false },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When listing groups for own org via show', () => {
    it('Should be allowed for own-org user', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When listing groups for another org via show', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When fetching the orgList for own org', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/groups`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When fetching the orgList for another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/groups`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When fetching a single group as own-org user', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When fetching a single group as cross-org user', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When updating a group as cross-org user', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'PATCH',
        body: { name: 'hijacked' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When updating a group as own-org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'PATCH',
        body: { name: 'Renamed Group' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When deleting a group as cross-org user', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When deleting a group as own-org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/group/${
          group.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
