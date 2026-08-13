// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { generatePoint, performDrag } from './task-map-drag-helpers.cy'

// const checkTaskOrder = (startIndex, taskNames) => {
//   for (let i = 0; i < taskNames.length; i++) {
//     // eslint-disable-next-line no-loop-func
//     it('task name is as expected', () => {
//       cy.get('[data-test=task-cell-test]')
//         .eq(startIndex + i)
//         .should('contain', taskNames[i])
//     })
//   }
// }

// describe('task_map_drag_and_drop_level_a_tasks.cy', () => {
//   let user, fixture, appPage

//   before(() => {
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
//                   tasks: [
//                     { name: 'Alpha' },
//                     { name: 'Beta' },
//                     { name: 'Gamma' },
//                   ],
//                 },
//                 {
//                   name: 'Test 2',
//                 },
//                 {
//                   name: 'Test 3',
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
//       appPage.visitTaskMap()
//     })

//     it('should set the correct document title', () => {
//       cy.title().should('eq', 'Matters | Juralio')
//     })

//     describe('Drag second task to the top', () => {
//       before(() => {
//         performDrag(4, generatePoint(30, 70))
//       })
//       it('should show the done subtasks in the expected order after drag & drop', () => {
//         checkTaskOrder(0, ['Test 2', 'Test 1', 'Test 3'])
//       })
//     })
//   })
//   describe('Drag the third task into second place', () => {
//     before(() => {
//       performDrag(3, generatePoint(30, 100))
//     })
//     it('should have task 3 as the second level a task', () => {
//       checkTaskOrder(0, ['Test 2', 'Test 3', 'Test 1'])
//     })
//   })
//   describe('Drag the top task to the bottom', () => {
//     before(() => {
//       performDrag(1, generatePoint(30, 300))
//     })
//     it('should have task 3 as the second level a task', () => {
//       checkTaskOrder(0, ['Test 3', 'Test 1', 'Test 2'])
//     })
//   })
//   describe('Dragging a level A item to the right', () => {
//     before(() => {
//       cy.backendRoute('PATCH', '/matter/*/projects/*/tasks*').as('updateTasks')
//       cy.window().then(win => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(1)
//           .trigger('mousedown', {
//             view: win,
//           })
//           .trigger('mousemove', {
//             clientX: 3000,
//             clientY: 0,
//             force: true,
//           })
//           .trigger('mouseup', {
//             force: true,
//             view: win,
//           })
//       })
//     })

//     it('should retain the existing order', () => {
//       checkTaskOrder(0, ['Test 3', 'Test 1', 'Test 2'])
//     })
//   })
//   describe('Drag should persist accross reloads', () => {
//     before(() => {
//       cy.reload()
//       cy.login(user.username)
//       appPage.visitTaskMap()
//     })
//     it('should have task 3 as the second level a task', () => {
//       checkTaskOrder(0, ['Test 3', 'Test 1', 'Test 2'])
//     })
//   })
// })
