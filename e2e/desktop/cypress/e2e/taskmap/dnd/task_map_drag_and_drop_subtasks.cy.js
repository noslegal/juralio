// import {
//   generateFixture,
//   getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import {
//   checkTaskOrder,
//   doDragNoComplete,
//   generatePoint,
//   performDrag
// } from './task-map-drag-helpers.cy'

// const Test1CellStartIndex = 4
// const Test2CellStartIndex = 6
// const Test3CellStartIndex = 8

// describe('task_map_drag_and_drop_subtasks.cy', () => {
//   let user, fixture, appPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'taskMapDNDTest',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'Test 1',
//                   tasks: [
//                     { name: 'Alpha' },
//                     { name: 'Beta' },
//                     { name: 'Gamma' },
//                   ],
//                 },
//                 {
//                   name: 'Test 2',
//                   tasks: [{ name: 'Delta' }],
//                 },
//                 {
//                   name: 'Test 3',
//                   tasks: [
//                     { name: 'Epsilon', tasks: [{}, {}, {}, {}] },
//                     { name: 'Zeta' },
//                     { name: 'Eta' },
//                     { name: 'Theta' },
//                     { name: 'Iota' },
//                     { name: 'Kappa' },
//                     { name: 'Lambda' },
//                     { name: 'Mu' },
//                   ],
//                 },
//               ],
//             },
//             {
//               tasks: [
//                 {
//                   name: 'Test 3',
//                   tasks: [
//                     { name: 'Epsilon', tasks: [{}, {}, {}, {}] },
//                     { name: 'Zeta', properties: { status: 'in-progress' } },
//                     { name: 'Eta', properties: { status: 'in-progress' } },
//                     { name: 'Theta', properties: { status: 'in-progress' } },
//                     { name: 'Iota' },
//                     { name: 'Kappa' },
//                     { name: 'Lambda' },
//                     { name: 'Mu' },
//                   ],
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

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//     })

//     it('should set the correct document title', () => {
//       cy.title().should('eq', 'Matters | Juralio')
//     })

//     describe('Test1 - basic subtask reorder', () => {
//       before(() => {
//         performDrag(Test1CellStartIndex + 1, generatePoint(500, 30))
//       })

//       checkTaskOrder(Test1CellStartIndex, ['Beta', 'Alpha', 'Gamma'])

//       describe('Test1 - subsequent subtask reorder', () => {
//         before(() => {
//           performDrag(Test1CellStartIndex + 1, generatePoint(500, 30))
//         })

//         checkTaskOrder(Test1CellStartIndex, ['Alpha', 'Beta', 'Gamma'])
//       })
//     })

//     describe('Test2 - Reorder of sole subtask does not result in change', () => {
//       before(() => {
//         performDrag(Test2CellStartIndex + 1, generatePoint(730, 70), {
//           wait: false,
//         })
//       })

//       checkTaskOrder(Test2CellStartIndex + 1, ['Delta'])
//     })

//     describe('Test3 - subtask with 8 children reorder', () => {
//       before(() => {
//         performDrag(Test3CellStartIndex + 1, generatePoint(550, 700))
//       })

//       checkTaskOrder(Test3CellStartIndex, [
//         'Epsilon',
//         'Eta',
//         'Theta',
//         'Iota',
//         'Kappa',
//         'Lambda',
//       ])
//     })
//   })
//   describe('when navigating to the task map ', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap(1)
//     })
//     describe('when moving a task over its own position', () => {
//       before(() => {
//         doDragNoComplete(2, generatePoint(550, 100))
//       })
//       it('should not show a dropzone', () => {
//         cy.get('[data-test=drop-zone-pointer]').should('not.be.visible')
//       })
//     })
//     describe('when moving a task over a task in the same status', () => {
//       before(() => {
//         doDragNoComplete(2, generatePoint(550, 250))
//       })
//       it('should not show a dropzone', () => {
//         cy.get('[data-test=drop-zone-pointer]').should('be.visible')
//         cy.get('[data-test=drop-zone-pointer]')
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(91, 21, 223)')
//       })
//     })
//     describe('when moving a task over a task in the different status', () => {
//       before(() => {
//         doDragNoComplete(2, generatePoint(550, 500))
//       })
//       it('should not show a dropzone', () => {
//         cy.get('[data-test=drop-zone-pointer]').should('be.visible')
//         cy.get('[data-test=drop-zone-pointer]')
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(80, 76, 75)')
//         cy.wait(1000)
//         cy.get('[data-test=dropzone-bad-status-tooltip]').should('be.visible')
//         cy.get('[data-test=dropzone-bad-status-tooltip]').should(
//           'have.text',
//           'Tasks cannot be reordered outside their status'
//         )
//       })
//     })
//   })
// })
