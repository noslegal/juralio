import faker from 'faker'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { updateDefaultPassword } from '../../../../../helpers/users/user_api_helper'

describe('org_owner_api_spec_part_2', () => {
  describe('when an owner tires to remove their own org admin role', () => {
    let org, u1, u2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body

          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          })
            .then(res => {
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u2 = res.body
            })
            .then(() => {
              updateDefaultPassword(u1)
            })
        })
      })
    })
    it('should not remove the role', () => {
      cy.login(u1.username, 'Password2Password2$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          roles: ['ROLE_USER', 'ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when an owner tires to remove another owners own org admin role', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            updateDefaultPassword(res.body)
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u2 = res.body
          })
        })
      })
    })
    it('should not remove the role', () => {
      cy.login(u2.username, 'Password2Password2$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          roles: ['ROLE_USER', 'ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when an org admin tires to remove an owners own org admin role', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            updateDefaultPassword(res.body)
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
            u2 = res.body
          })
        })
      })
    })
    it('should not remove the role', () => {
      cy.login(u2.username, 'Password2Password2$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          roles: ['ROLE_USER', 'ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when adding the 4th owner', () => {
    let org, u1, u2, u3
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
            },
          }).then(res => {
            updateDefaultPassword(res.body)
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u2 = res.body
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o.body.id },
                roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
              },
            }).then(res => {
              updateDefaultPassword(res.body)
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u3 = res.body
            })
          })
        })
      })
    })
    it('should not allow the 4th owner', () => {
      cy.apiSpecRequest({
        method: 'POST',
        url: `${Cypress.env('serverBaseUrl')}/users`,
        body: {
          username: faker.internet.email().toLowerCase(),
          organisation: { id: org.id },
          roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when updating a user to be the 4th owner', () => {
    let org, u1, u2, u3, u4
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
            },
          }).then(res => {
            updateDefaultPassword(res.body)
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u2 = res.body
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o.body.id },
                roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
              },
            }).then(res => {
              updateDefaultPassword(res.body)
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u3 = res.body
              cy.apiSpecRequest({
                method: 'POST',
                url: `${Cypress.env('serverBaseUrl')}/users`,
                body: {
                  username: faker.internet.email().toLowerCase(),
                  organisation: { id: o.body.id },
                  roles: ['ROLE_ORG_ADMIN'],
                },
              }).then(res => {
                updateDefaultPassword(res.body)
                expect(res.status).to.eq(201)
                expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
                expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
                u4 = res.body
              })
            })
          })
        })
      })
    })
    it('should not let the 4th user be an owner', () => {
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u4.id}`,
        body: {
          roles: ['ROLE_USER', 'ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
})
