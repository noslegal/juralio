// import faker from 'faker'
// import { enableSSO } from '../../../../helpers/admin/admin_api_helpers'

// import { visitHome } from '../../../../helpers/admin/admin_visit_helpers'
// import {
//   sysadminAddUserToOrganisation,
//   updateOrganisation,
// } from '../../../../helpers/organisation/organisation_api_helper'

// const {
//   createUser,
//   createMicrosoftUser,
//   DEFAULT_ORGANISATION_ID,
// } = require('../../../../helpers/users/user_api_helper')

// describe('convert_user.cy', () => {
//   let user1, user2
//   before(() => {
//     createUser()
//       .then(res => {
//         user1 = res
//       })
//       .then(() => {
//         enableSSO()
//         createMicrosoftUser(faker.internet.email().toLowerCase()).then(res => {
//           user2 = res
//         })
//         sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user1)
//         cy.login(user1)
//         updateOrganisation(DEFAULT_ORGANISATION_ID, true, true)
//       })
//   })
//   describe('when the user is a microsoft user', () => {
//     before(() => {
//       cy.login(user1)
//       visitHome()
//       cy.get('[data-test=user-avatar]').click()
//       cy.get('[data-test=user-header-org-menu-button]').click()

//       cy.get('[data-test=search-button]', { timeout: 30000 }).click({
//         timeout: 10000,
//       })
//       cy.get('[data-test=Search]').type(`${user2.username}{enter}`)
//       cy.get('[data-test=user-list-item]').eq(0).click()
//     })
//     it('should show the user account options', () => {
//       cy.get('[data-test=reset-password-link]').should('not.exist')
//       cy.get('[data-test=convert-to-juralio]').should('be.visible')
//     })
//     describe('when converting to a juralio user', () => {
//       before(() => {
//         cy.get('[data-test=convert-to-juralio]').click()
//         cy.get('[data-test=action-dialog-button]').click()
//       })
//       it('should tell the user how to log in', () => {
//         cy.get('[data-test=temporary-password-message]').should('be.visible')
//       })
//     })
//   })
//   describe('when the user is a juralio user', () => {
//     before(() => {
//       cy.login(user1)
//       visitHome()
//       cy.get('[data-test=user-avatar]').click()
//       cy.get('[data-test=user-header-org-menu-button]').click()
//       cy.get('[data-test=search-button]', { timeout: 30000 }).click({
//         timeout: 10000,
//       })
//       cy.get('[data-test=Search]').type(`${user2.username}{enter}`)
//       cy.get('[data-test=user-list-item]').eq(0).click()
//     })
//     it('should show the user account options', () => {
//       cy.get('[data-test=reset-password-link]').should('be.visible')
//       cy.get('[data-test=convert-to-ms]').should('be.visible')
//     })
//     describe('when converting to a microsoft user', () => {
//       before(() => {
//         cy.get('[data-test=convert-to-ms]').click()
//         cy.get('[data-test=action-dialog-button]').click()
//       })
//       it('should tell the user how to log in', () => {
//         cy.get('[data-test=dialog-prompt-text]').should(
//           'have.text',
//           'This user will need to log in with the "Sign in with Microsoft" button on the Juralio login page.'
//         )
//       })
//     })
//     describe('after converting', () => {
//       before(() => {
//         visitHome()
//       })
//       it('should log out the user', () => {
//         cy.get('[data-test=password-submit-button]').should('be.visible')
//       })
//     })
//     describe('should not be able to log in with a password', () => {
//       it('should not log the user in', () => {
//         cy.request({
  
//           url: `${Cypress.env('serverBaseUrl')}/login`,
//           method: 'POST',
//           body: {
//             username: user1.username,
//             password: user1.password,
//           },
//           failOnStatusCode: false,
//         }).then(res => {
//           expect(res.status).to.equal(400)
//         })
//       })
//     })
//   })
// })
