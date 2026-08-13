//internal user

import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

const getName = firstname => {
  return firstname.slice(-1) === 's' ? firstname + "'" : firstname + "'s"
}
//external user
describe('sysadmin_personal_matter_creation.cy', () => {
  let internal_user, external_user, org_admin
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
      createUser('', true, true, {}, false, false).then(o => {
        org_admin = o
        cy.login(org_admin.username).then(() => {
          createUser(
            '',
            true,
            true,
            { organisation: { id: DEFAULT_ORGANISATION_ID } },
            false,
            false,
            false
          ).then(u => {
            internal_user = u
            createUser('externalUser', true, false, {
              organisation: { id: DEFAULT_ORGANISATION_ID },
              isExternal: true,
            }).then(u2 => {
              external_user = u2
            })
          })
        })
      })
    })
  })
  describe('when getting my matters as a internal user', () => {
    it('should have my personal matter', () => {
      cy.login(internal_user.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matters`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(1)
          expect(response.body[0].name).to.eq(
            getName(internal_user.firstname) + ' personal matter'
          )
          expect(response.body[0].projects[0].name).to.eq(
            getName(internal_user.firstname) + ' personal workstream'
          )
        })
      })
    })
  })
  describe('when getting my matters as a external user', () => {
    it('should not have my personal matter', () => {
      cy.login(external_user.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matters`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
        })
      })
    })
  })
  describe('when converting an external user to an internal user ', () => {
    it('should not create a personal matter', () => {
      cy.login(org_admin.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${external_user.id}`,
          method: 'PATCH',
          body: {
            isExternal: false,
          },
        }).then(response => {
          expect(response.status).to.eq(200)
          cy.login(external_user.username).then(() => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/matters`,
              method: 'GET',
            }).then(response => {
              expect(response.body.length).to.eq(0)
            })
          })
        })
      })
    })
  })
})
