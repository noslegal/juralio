import faker from 'faker'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  updateDefaultPassword,
  updateFTUE,
  updateUser,
} from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('org_owner_display.cy', () => {
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })
  })
  describe('org owner can an another internal user as an org owner', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: [],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            user2 = res.body
            cy.login(user.username, 'Password2Password2$')
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
            cy.get('[data-test=org-owner-checkbox]').click()
            cy.backendRoute('/organisations/**/users').as('getUsers')
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait('@getUsers')
            cy.wait(5000)
            cy.get('[data-test=search-button]', {
              timeout: 30000,
            }).click()
            cy.get('[data-test=Search]').clear().type(user2.username)
          })
        })
      })
    })
    it('should add them as an owner', () => {
      cy.get('[data-rowindex=0] [data-field=roles]').should(
        'contain.text',
        'Org owner'
      )
      cy.get('[data-rowindex=0] [data-field=roles]').should(
        'contain.text',
        'Org admin'
      )
    })
  })
  describe('org owner cannot an an external user as an org owner', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: [],
              isExternal: true,
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            user2 = res.body
            cy.login(user.username, 'Password2Password2$')
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
          })
        })
      })
    })
    it('should now show the option to add them as an owner', () => {
      cy.get('[data-test=org-owner-checkbox]').should('not.exist')
    })
  })
  describe('org owner cannot an an inactive user as an org owner', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: [],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            user2 = res.body
            updateUser({ id: user2.id, enabled: false })
            cy.login(user.username, 'Password2Password2$')
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
          })
        })
      })
    })
    it('should now show the option to add them as an owner', () => {
      cy.get('[data-test=org-owner-checkbox]').should('not.exist')
    })
  })
  describe('when there are already 3 org owners', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: [],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            user2 = res.body
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                firstname: 'john',
                lastname: 'doe',
                roles: ['ROLE_ORG_OWNER'],
              },
            }).then(() => {
              cy.apiSpecRequest({
                method: 'POST',
                url: `${Cypress.env('serverBaseUrl')}/users`,
                body: {
                  username: faker.internet.email().toLowerCase(),
                  firstname: 'john',
                  lastname: 'doe',
                  roles: ['ROLE_ORG_OWNER'],
                },
              }).then(() => {
                cy.login(user.username, 'Password2Password2$')
                visitHelpers.visitOrgUsers()
                cy.get('[data-test=search-button]').click()
                cy.get('[data-test=Search]')
                  .type(user2.username)
                cy.get('[data-rowindex=0] [data-colindex=0]', {
                  timeout: 30000,
                }).click()
              })
            })
          })
        })
      })
    })
    it('should not let another owner be added', () => {
      cy.get('[data-test=org-owner-checkbox]').should('exist')
      cy.get('[data-test=org-owner-checkbox]').should(
        'have.class',
        'Mui-disabled'
      )
    })
  })
  describe('when the owner tries to remove themself', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')

          visitHelpers.visitOrgUsers()
          cy.get('[data-test=search-button]').click()
          cy.get('[data-test=Search]').type(user.username)
          cy.get('[data-rowindex=0] [data-colindex=0]', {
            timeout: 30000,
          }).click()
          cy.get('[data-test=org-owner-checkbox]').click()
        })
      })
    })
    it('should not be allowed if they are the only owner', () => {
      cy.get('[data-test=update-user-error-message]').should('be.visible')
      cy.get('[data-test=update-user-error-message]').should(
        'have.text',
        'Cannot remove the only organisation owner'
      )
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })
  })
  describe('when the owner tries to remove themself', () => {
    let user, org
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
            cy.get('[data-test=org-owner-checkbox]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })
        })
      })
    })
    it('should make them confirm their choice', () => {
      cy.get('[data-test=dialog-prompt-text]').should(
        'have.text',
        'Remember that, if you proceed to remove yourself as an owner, you’ll have no ability to reverse this. Only a continuing owner can do so'
      )
    })
    describe('when the confirm', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').eq(1).click()
        cy.wait(5000)
        cy.get('[data-test=search-button]').click()
        cy.get('[data-test=Search]').clear().type(user.username)
      })
      it('should remove them as an owner', () => {
        cy.get('[data-rowindex=0] [data-field=roles]').should(
          'not.contain.text',
          'Org owner'
        )
        cy.get('[data-rowindex=0] [data-field=roles]').should(
          'contain.text',
          'Org admin'
        )
      })
    })
  })
  describe('when the owner tries to remove another owner', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_OWNER', 'ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
            cy.get('[data-test=org-owner-checkbox]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(5000)
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').clear().type(user2.username)
          })
        })
      })
    })
    it('should remove their owner role', () => {
      cy.get('[data-rowindex=0] [data-field=roles]').should(
        'not.contain.text',
        'Org owner'
      )
      cy.get('[data-rowindex=0] [data-field=roles]').should(
        'contain.text',
        'Org admin'
      )
    })
  })
  describe('when an org owner views their roles', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_OWNER', 'ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
          })
        })
      })
    })
    it('should not let them remove the org admin role', () => {
      cy.get('[data-test=org-admin-checkbox]').should(
        'have.class',
        'Mui-disabled'
      )
    })
  })
  describe('when an org owner views another owners roles', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_OWNER', 'ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
          })
        })
      })
    })
    it('should not let them remove the org admin role', () => {
      cy.get('[data-test=org-admin-checkbox]').should(
        'have.class',
        'Mui-disabled'
      )
    })
  })
  describe('when an org admin views and org owners roles', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user.username)
            cy.get('[data-rowindex=0] [data-colindex=0]', {
              timeout: 30000,
            }).click()
          })
        })
      })
    })
    it('should not let them remove the org admin role', () => {
      cy.get('[data-test=org-admin-checkbox]').should(
        'have.class',
        'Mui-disabled'
      )
    })
  })
  describe('when trying to make another org admin inactive', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user2.username)
          })
        })
      })
    })
    it('should allow it', () => {
      cy.get('[data-test=status-select-readonly]').should('not.exist')
      cy.get('[data-test=status-select-selection-dropdown]').should('exist')
    })
  })
  describe('when trying to make the only org admin inactive', () => {
    let user, org, user2
    before(() => {
      createOrganisation('', false).then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: org.id },
            firstname: 'john',
            lastname: 'doe',
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          user = res.body
          updateDefaultPassword(user)
          updateFTUE(user, { hasSeenOrgAdmin: true })
          cy.login(user.username, 'Password2Password2$')
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              firstname: 'john',
              lastname: 'doe',
              roles: ['ROLE_ORG_ADMIN'],
            },
          }).then(res => {
            user2 = res.body
            expect(res.status).to.eq(201)
            visitHelpers.visitOrgUsers()
            cy.get('[data-test=search-button]').click()
            cy.get('[data-test=Search]').type(user.username)
          })
        })
      })
    })
    it('should not allow it', () => {
      cy.get('[data-test=status-select-readonly]').should('exist')
      cy.get('[data-test=status-select-selection-dropdown]').should('not.exist')
    })
  })
})
