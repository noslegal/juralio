//create u1 - org owner
//create u2 - not org owner
import faker from 'faker'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'

describe('sa_add_first_user_auto_create_org_owner.cy', () => {
  let organisation, owner, not_owner, organisation_2, groupId
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createOrganisation().then(o => {
      expect(o.status).to.eq(201)
      organisation = o.body
      groupId = o.body.organisationGroup.id
    })
  })
  it('should add the first user as an org owner', () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() =>
      cy
        .request({
          url: `${Cypress.env('serverBaseUrl')}/users/bulk`,
          method: 'POST',
          body: {
            firstname: '',
            isExternal: false,
            isThirdPartyUser: false,
            lastname: '',
            organisation: { id: organisation.id },
            roles: [],
            thirdPartyProvider: null,
            usernames: [faker.internet.email().toLowerCase()],
            group: groupId,
          },
        })
        .then(res => {
          owner = res.body
          expect(res.status).to.eq(200)
          expect(res.body.createdUsers[0].roles.length).to.eq(3)
          expect(res.body.createdUsers[0].roles).to.contain('ROLE_ORG_OWNER')
          expect(res.body.createdUsers[0].roles).to.contain('ROLE_ORG_ADMIN')
        })
    )
  })
  describe('when adding a second user', () => {
    it('should not add the org owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/users/bulk`,
            method: 'POST',
            body: {
              firstname: '',
              isExternal: false,
              isThirdPartyUser: false,
              lastname: '',
              organisation: { id: organisation.id },
              roles: [],
              thirdPartyProvider: null,
              usernames: [faker.internet.email().toLowerCase()],
              group: groupId,
            },
          })
          .then(res => {
            owner = res.body
            expect(res.status).to.eq(200)
            expect(res.body.createdUsers[0].roles.length).to.eq(1)
            expect(res.body.createdUsers[0].roles).to.contain('ROLE_USER')
          })
      )
    })
  })
  describe('when adding multiple users at one', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        expect(o.status).to.eq(201)
        organisation_2 = o.body
        groupId = o.body.organisationGroup.id
      })
    })
    it('should only add the first user as an owner', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/users/bulk`,
            method: 'POST',
            body: {
              firstname: '',
              isExternal: false,
              isThirdPartyUser: false,
              lastname: '',
              organisation: { id: organisation_2.id },
              roles: [],
              thirdPartyProvider: null,
              usernames: [
                faker.internet.email().toLowerCase(),
                faker.internet.email().toLowerCase(),
              ],
              group: groupId,
            },
          })
          .then(res => {
            owner = res.body
            expect(res.status).to.eq(200)
            expect(res.body.createdUsers[0].roles.length).to.eq(3)
            expect(res.body.createdUsers[0].roles).to.contain('ROLE_ORG_OWNER')
            expect(res.body.createdUsers[0].roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.createdUsers[1].roles.length).to.eq(1)
            expect(res.body.createdUsers[1].roles).to.contain('ROLE_USER')
          })
      )
    })
  })
})
