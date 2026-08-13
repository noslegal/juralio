// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// describe('roadmap_drag_and_drop_date_pin_actual_spec.cy', () => {
//   let user, fixture, appPage

//   let tenDaysBeforeNow = new Date()
//   let tenDaysFromNow = new Date()
//   let twentyDaysFromNow = new Date()
//   const now = new Date()

//   before(() => {
//     now.setMinutes(now.getMinutes() - 15)
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
//                     status: 'done',
//                     actualStartDate: tenDaysBeforeNow,
//                     actualEndDate: now,
//                   },
//                 },
//                 {
//                   name: 'Test 2',
//                   properties: {
//                     status: 'in-progress',
//                     actualStartDate: now,
//                     plannedEndDate: tenDaysFromNow,
//                   },
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
//       cy.get('[data-test=status-filter-selected-text]').click()
//       cy.get('[data-test=done-checkbox]').click()
//       cy.get('[data-test=status-filter-selected-text]').click({ force: true })
//     })

//     it('should set the correct document title', () => {
//       cy.title().should('contain', 'Roadmap |')
//     })

//     describe('Drag done end past today should not work', () => {
//       before(() => {
//         cy.window().then(win => {
//           cy.get('[data-test="timeline-navigation-button"]')
//           cy.get('[data-test=roadmap-end-pin]')
//             .eq(0)
//             .trigger('mousedown', {
//               view: win,
//             })
//             .trigger('mousemove', {
//               clientX: 1000,
//               clientY: 0,
//             })
//             .trigger('mouseup', {
//               view: win,
//             })
//         })
//       })
//       it('should not show the confirm button', () => {
//         cy.get('[date-test="confirm-drag"]').should('not.exist')
//       })
//     })

// describe('Drag actual start date past today should stop on today', () => {
//   before(() => {
//     cy.login(user.username)
//     appPage.visitRoadmap()
//     cy.get('[data-test=status-filter-selected-text]').click()
//     cy.get('[data-test=done-checkbox]').click()
//     cy.get('[data-test=status-filter-selected-text]').click({ force: true })
//     cy.window().then(win => {
//       cy.get('[data-test="timeline-navigation-button"]')
//       cy.wait(2000)
//       cy.get('[data-test=roadmap-start-pin]')
//         .eq(0)
//         .trigger('mousedown', {
//           view: win,
//         })
//         .trigger('mousemove', {
//           clientX: 1000,
//           clientY: 0,
//         })
//         .trigger('mouseup', {
//           view: win,
//         })
//     })
//     cy.get('[date-test="confirm-drag"]').click()
//   })
//   it('should show the done subtasks in the expected order after drag & drop', () => {
//     cy.wait(3000)
//     cy.get('[data-test=task-cell-test]', { timeout: 30000 }).eq(0).click()
//     cy.get('[data-test=planned-end-date]').should(
//       'contain',
//       cy
//         .get('[data-test=planned-start-date]')
//         .should(
//           'not.contain',
//           getDateDisplayString(dayjs(now), DATE_FORMAT_FULL, false)
//         )
//     )
//   })
// })
//   })
// })
