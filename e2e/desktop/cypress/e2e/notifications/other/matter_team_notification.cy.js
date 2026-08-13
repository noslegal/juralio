// import {
//   generateFixture,
//   getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { checkGlobalNotificationCount } from '../../../../../helpers/notifications/global-notification-helper'
// import { checkNotificationCount } from '../../../../../helpers/notifications/inbox-notification-helper'
// /* eslint-disable arrow-parens */
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

// describe('matter_team_notification.cy', () => {
//   let user1, user2, fixture, appPage
//   const INITIAL_NOTIFICATION_COUNT = 0

//   before(() => {
//     createUser('x').then(createdUser => {
//       user2 = createdUser
//       createUser('z').then(createdUser => {
//         user1 = createdUser
//         const seed = {
//           matter: {
//             prefix: 'New Matter',
//             teamMembers: [user1, user2],
//             matterAdmins: [user1],
//             projects: [
//               {
//                 name: 'Alpha Project',
//                 tasks: [{ name: 'Moon', teamMembers: [user1] }],
//               },
//               {
//                 name: 'Beta Project',
//                 tasks: [{ name: 'Sun', teamMembers: [user1] }],
//               },
//             ],
//           },
//         }
//         fixture = generateFixture(seed)
//         appPage = getWrapper(fixture)
//       })
//     })
//   })

//   describe('when viewing the Home page after initial creation', () => {
//     before(() => {
//       cy.login(user1.username)
//       appPage.visitHome()
//     })

//     describe('the Homepage inbox notifications do not show the tasks I have created so far', () => {
//       checkGlobalNotificationCount(INITIAL_NOTIFICATION_COUNT)
//     })
//   })

//   describe('when viewing the Home page after removing a user as a matter member as the logged in user', () => {
//     before(() => {
//       cy.login(user1.username)
//       appPage.visitMatter()
//       cy.get('[data-test=matter-people]').click()
//       cy.get('[data-test=matter-content]').should('contain', 'View and edit')
//       cy.get('[data-test=matter-content]').eq(0).click()
//       cy.get('[data-test=no-access]').click()
//       appPage.visitHome()
//     })

//     describe('there should NOT be a new matter member notification', () => {
//       checkGlobalNotificationCount(0)
//     })

//     describe('when viewing the Home page after adding a user as a matter admin as the logged in user', () => {
//       before(() => {
//         cy.login(user1.username)
//         appPage.visitMatter()
//         cy.get('[data-test=matter-people]').click()
//         cy.backendRoute('POST', '/admin/matter/*/matters').as('postMatterAdmin')

//         cy.get('[data-test=is-admin]').eq(1).find('[type="checkbox"]').check()
//         cy.wait('@postMatterAdmin')
//         appPage.visitHome()
//       })

//       describe('there should NOT be a new matter admin notification', () => {
//         checkGlobalNotificationCount(0)
//       })
//       describe('the Alpha timeline Project should include matter membership notifications', () => {
//         const PROJECT_NOTIFICATION_COUNT = 9

//         before(() => {
//           cy.login(user1.username)
//           appPage.visitProjectTimeLine(0)
//         })
//         checkNotificationCount(PROJECT_NOTIFICATION_COUNT)
//       })
//     })

//     describe('When clicking on the post notification', () => {
//       before(() => {
//         globalNotificationsPage.get.notificationButton().click()
//         globalNotificationsPage.get.notifications().eq(0).click()
//       })
//       it('should go to the matter admin area', () => {
//         cy.url().should('contain', '/overview')
//       })
//     })
//   })
// })
