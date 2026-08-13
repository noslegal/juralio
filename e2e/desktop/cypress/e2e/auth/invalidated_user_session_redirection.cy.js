// import {
//   addMatterAdmin,
//   addTeamMember,
//   createMatter,
// } from '../../../../helpers/matterprojects/matter_api_helper'
// import {
//   createUser,
//   updateFTUE,
// } from '../../../../helpers/users/user_api_helper'

// describe('invalidated_user_session_redirection.cy', () => {
//   let matter, user, matterDetailsUrl

//   before(() => {
//     createUser()
//       .then(createdUser => {
//         user = createdUser
//         updateFTUE(user, { hasSeenMatterAdmin: true })
//         return createMatter()
//       })
//       .then(createdMatter => {
//         matter = createdMatter
//         matterDetailsUrl = `/#/matteradmin/${matter.id}`
//         addMatterAdmin(matter.id, user.id)
//         addTeamMember(matter.id, user.id)
//       })
//   })

//   describe('when session is invalidated', () => {
//     describe('when a user reloads the page', () => {
//       before(() => {
//         cy.login(user.username)
//         visitMatterDetails()
//         cy.logoutServerSide()
//         cy.visit(`/#/matter/${matter.id}/overview`)
//       })

//       it('should redirect to login page', () => {
//         cy.url().should('contains', 'login')
//       })
//     })

//     describe('when a user calls the api', () => {
//       before(() => {
//         cy.login(user.username)
//         visitMatterDetails()
//         cy.logoutServerSide()

//         cy.get('[data-test=matter-people]').click()
//       })

//       it('should redirect to login page', () => {
//         cy.url().should('contains', 'login')
//       })
//     })

//     describe('when a standard user logs back in after session has expired', () => {
//       before(() => {
//         cy.login(user.username)
//         visitMatterDetails()
//         cy.logoutServerSide()
//         cy.visit(`/#/matter/${matter.id}/overview`)
//         cy.get('[data-test="username-input"]').find('input').type(user.username)
//         cy.get('[data-test="password-input"] input')
//           .type('Password2Password2$')
//           .type('{enter}')
//       })

//       it('should return the user to the page they were on', () => {
//         cy.url().should('contain', '/overview')
//       })
//     })
//   })

//   function visitMatterDetails() {
//     cy.backendRoute('/matter/*').as('matterFetch')
//     cy.backendRoute('/matter/*/team*').as('teamFetch')

//     cy.visit(matterDetailsUrl)

//     cy.wait('@matterFetch')
//     cy.wait('@teamFetch')
//   }
// })
