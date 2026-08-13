// import {
//   generateFixture,
//   getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import {
//   checkTaskOrder,
//   generatePoint,
//   performDrag
// } from './task-map-drag-helpers.cy'

// const Test1CellStartIndex = 4
// const Test2CellStartIndex = 6
// const Test3CellStartIndex = 8

// describe('task_map_drag_and_drop_filter.cy', () => {
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
//       cy.get('[data-test="person-filter-selected-text"]').click()
//       cy.get('[data-test="person-filter-you"]').click()
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
//   })
// })
