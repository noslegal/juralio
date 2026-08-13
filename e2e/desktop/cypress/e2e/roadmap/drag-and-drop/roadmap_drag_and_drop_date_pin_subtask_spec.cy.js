// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// describe('roadmap_drag_and_drop_date_pin_subtask_spec.cy', () => {
//   let user, fixture, appPage

//   let tenDaysBeforeNow = new Date()
//   let oneDayFromNow = new Date()
//   let tenDaysFromNow = new Date()
//   let twentyDaysFromNow = new Date()
//   const now = new Date()

//   before(() => {
//     now.setMinutes(now.getMinutes() - 15)
//     oneDayFromNow.setDate(now.getDate() + 1)
//     tenDaysBeforeNow.setDate(now.getDate() - 10)
//     tenDaysFromNow.setDate(now.getDate() + 10)
//     twentyDaysFromNow.setDate(now.getDate() + 20)
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'taskMapDNDLevelATest',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'Test 1',
//                   properties: {
//                     plannedStartDate: now,
//                     plannedEndDate: tenDaysFromNow,
//                   },
//                   tasks: [
//                     {
//                       name: 'Test 2',
//                       properties: {
//                         status: 'not-started',
//                         plannedStartDate: oneDayFromNow,
//                         plannedEndDate: tenDaysFromNow,
//                       },
//                     },
//                   ],
//                 },
//               ],
//             },
//             {},
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitRoadmap()
//     })

//     it('should set the correct document title', () => {
//       cy.title().should('contain', 'Roadmap |')
//     })

//     describe('Drag level A should pull child task with it', () => {
//       before(() => {
//         cy.window().then(win => {
//           cy.get('[data-test="timeline-navigation-button"]')
//           cy.get('[data-test=roadmap-start-pin]')
//             .eq(0)
//             .trigger('mousedown', {
//               view: win,
//             })
//             .trigger('mousemove', {
//               clientX: 500,
//               clientY: 0,
//             })
//             .trigger('mouseup', {
//               view: win,
//               force: 'true',
//             })
//         })
//       })
//       it('should not show the confirm button', () => {
//         cy.wait(5000)
//         cy.get('[date-test="dialog-header-title-text"]').should(
//           'include',
//           'Impact of date change'
//         )
//       })
//     })
//   })
// })
