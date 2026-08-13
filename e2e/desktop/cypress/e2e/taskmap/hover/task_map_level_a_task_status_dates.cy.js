// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'
// import {
//   createSiblingAboveOnMap,
//   createSiblingBelowOnMap,
// } from '../../../../../helpers/taskmap/task-map-helper'
// import dateValueHelper from '../../../../../helpers/date/date_value_helper'

// describe('task_map_level_a_task_status_dates.cy', () => {
//   let user, fixture, appPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'task_map_level_a_task_status_dates.cy',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'Rook',
//                   properties: { status: 'in-progress' },
//                 },
//                 {
//                   name: 'Knight',
//                   properties: { status: 'done' },
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('when mousing over an IN PROGRESS task and creating a peer Level A', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap(0)
//       createSiblingBelowOnMap('Rook', 'King')
//       cy.wait(2000)
//     })

//     it('The task is displayed', () => {
//       cy.get('[data-test=task-cell-test]')
//         .eq(3)
//         .should('contain', 'King')
//     })

//     describe('When visiting the created Level A task', () => {
//       before(() => {
//         cy.reload() // Some weirdness in Cypress requires us to revisit the taskmap.
//         cy.login(user.username)
//         appPage.visitTaskMap(0)

//         cy.get('[data-test=task-cell-test]')
//           .eq(3)
//           .click({ force: true })
//       })

//       it('The task is displayed', () => {
//         taskDetailPage.get.taskDetailName().should('have.text', 'King')
//       })

//       it('The ASD should be set and the AED should NOT be set', () => {
//         taskDetailPage.taskDates.get
//           .actualStartDate()
//           .find('input')
//           .should('have.value', dateValueHelper.getCurrentDateAsString())
//         taskDetailPage.taskDates.get.actualEndDate().should('not.exist')
//       })
//     })
//   })

//   describe('when mousing over a DONE task and creating a peer Level A', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       createSiblingAboveOnMap('Knight', 'Pawn')
//       cy.wait(2000)
//     })

//     it('The task is displayed', () => {
//       cy.get('[data-test=task-cell-test]')
//         .eq(1)
//         .should('contain', 'Pawn')
//     })

//     describe('When visiting the created Task', () => {
//       before(() => {
//         cy.reload() // Some weirdness in Cypress requires us to revisit the taskmap.
//         cy.login(user.username)
//         appPage.visitTaskMap(0)
//         cy.get('[data-test=task-cell-test]')
//           .eq(1)
//           .click({ force: true })
//       })

//       it('The task is displayed', () => {
//         taskDetailPage.get.taskDetailName().should('have.text', 'Pawn')
//       })

//       it('The ASD should be set and the AED should be set', () => {
//         taskDetailPage.taskDates.get
//           .actualStartDate()
//           .find('input')
//           .should('have.value', dateValueHelper.getCurrentDateAsString())
//         taskDetailPage.taskDates.get
//           .actualEndDate()
//           .find('input')
//           .should('have.value', dateValueHelper.getCurrentDateAsString())
//       })
//     })
//   })
// })
