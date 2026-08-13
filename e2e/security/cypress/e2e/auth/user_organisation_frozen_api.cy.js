import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_organisation_frozen_api.cy', () => {
  let org, user
  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        user = u
        sysadminAddUserToOrganisation(org, user)
      })
    })
  })
  describe('when an organisation is not frozen', () => {
    it('should not add the frozen role', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: user.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(response.body.roles).to.not.contain('ROLE_ORG_FROZEN')
      })
    })
  })
  describe('when an organisation is frozen', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should add the frozen role', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/user`,
        method: 'GET',
      }).then(response => {
        console.log(response.body)
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(response.body.roles).to.contain('FROZEN_ORG_USER')
      })
    })
  })
  describe('when an organisation is unfrozen', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: false,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not add the frozen role', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/user`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(response.body.roles).to.not.contain('FROZEN_ORG_USER')
      })
    })
  })
  describe('when trying to update a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          samlSsoEnabled: true,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a user to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/users`,
        method: 'POST',
        body: {
          username: 'test@test.com',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a user to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/users`,
        method: 'DELETE',
        body: {
          username: 'test@test.com',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a matter to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matters`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update a matter to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234`,
        method: 'PATCH',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update a matter to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/matters`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete a matter to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/matters/12?`,
        method: 'DELETE',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to add a matter team member to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/teammembers`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete a matter team member to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/teammembers/1?`,
        method: 'DELETE',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to add a matter team member to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/viewers`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete a matter team member to a frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1234/viewers/1?`,
        method: 'DELETE',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to complete the tutorial when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/workstreams`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to create a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams`,
        method: 'POST',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/1/workstreams/2`,
        method: 'PATCH',
        body: {
          name: 'my matter',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to link tasks in  a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams/2/link`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a resource to a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams/2/resources`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a resource to a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/resources/22`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a resource to a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/resources/22`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to add a resource to a matter when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/resources`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a resource to a matter when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/resources/22`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a resource to a matter when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/resources/22`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a teammember to a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/teammembers`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to remove a teammember to a project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/teammembers/1`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to remove a teammember to a private project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/remove-private-teammember/22`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('when trying to add a task to project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams/2/tasks`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update a task to project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams/2/tasks`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to update a task in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/workstreams/2/task/3`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to link a task in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/link`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add task followers in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/followers`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete task followers in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/followers/4`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to add task team member in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/teammembers`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete task team member in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/teammembers/4`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to copy in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/copy`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to move in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/move`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to archive a task in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/archive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to unarchive a task in a  project when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/unarchive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a post to a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/posts`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update a post in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add a post author in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4/authors`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to remove a post author in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4/authors/5`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying to add a post member in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4/postmembers`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to remove a post member in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4/postmembers/5`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to move a post in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/post/4/move`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to restore a post in a task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/post/4`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying bulk save users when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users/bulk`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying save a user when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying save a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying delete a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/projecttemplates/1`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying add a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks/2`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying delete a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks/2`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying copy a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks/2/copy`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying move a template task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks/2/move`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying copy a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/copy`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying favourite a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/favourite`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying unfavourite a template when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/favourite`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying add a template resourcewhen frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/resources`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update a template resourcewhen frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/resources/2`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying delete a template resourcewhen frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/resources/2`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying add  a template post when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/1/tasks/2/posts`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update a template post when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/1/tasks/2/posts/3`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying delete a template post when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/1/tasks/2/posts/3`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying move a template post when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/1/tasks/2/posts/3/move`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying merge labels when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/labels/merge`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying add labels when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/1/labels`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying update labels when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/$matterId/labels/2`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })

  describe('when trying update org labels when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels/22`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying create org labels when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to add label to task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/3/labels`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to update label to task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/2/labels/4`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
  describe('when trying to delete a label to task when frozen org as a org user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}`,
        method: 'PATCH',
        body: {
          isFrozen: true,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow the update', () => {
      cy.login(user)
      cy.request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/1/workstreams/2/task/2/labels/4`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
        expect(res.body.text).to.eq('Organisation is currently frozen')
      })
    })
  })
})
