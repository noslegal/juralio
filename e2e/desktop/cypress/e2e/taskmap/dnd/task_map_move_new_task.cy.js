// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { performTemplateDrag, generatePoint } from './task-map-drag-helpers'
// import taskmapPage from '../../../../../page/taskmap/taskmap_page'

// describe(
//   'task_map_move_new_task.cy',
//   { retries: { runMode: 3, openMode: 3 } },
// () => {
//     let user, fixture, appPage
//     const taskCellMenu = taskmapPage.operationMenu

//     before(() => {
//       createUser()
//         .then(createdUser => {
//           user = createdUser
//           const seed = {
//             matter: {
//               prefix: 'taskMapDNDTest',
//               teamMembers: [user],
//               matterAdmins: [user],
//               projects: [
//                 {
//                   tasks: [
//                     {
//                       name: 'Test 1',
//                     },
//                   ],
//                 },
//               ],
//             },
//           }

//           fixture = generateFixture(seed)
//           appPage = getWrapper(fixture)
//         })
//         .then(() => {
//           cy.login(user.username)
//         })
//     })

//     describe('when navigating to the task map', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap()
//         triggerMouseOverForTask('Test 1')
//       })

//       describe('and the create child button is clicked, a task name is typed and enter is pressed', () => {
//         before(() => {
//           cy.get('[data-test=hover-button-below]').click()
//           cy.get('[data-test=edit-name-field] input').type('Yeti{Enter}')
//           cy.wait(2400)
//           cy.get('[data-test=edit-name-field] input').type('{Esc}')
//         })

//         it('should hide the input field and display the name in the new task cell', () => {
//           cy.get('[data-test=edit-name-field] input').should('not.exist')
//           cy.get('[data-test=task-cell-test] [data-task-name]')
//             .eq(1)
//             .should('have.text', 'Yeti')
//         })

//         describe('The task can be moved then archived successfully', () => {
//           before(() => {
//             cy.login(user.username)
//             appPage.visitTaskMap()
//             performTemplateDrag(2, generatePoint(900, 130), { wait: false })
//             cy.wait(400)
//             cy.get('[data-test=enterMoveMode]').click({ force: true })
//             cy.wait(500)
//             cy.get('[data-test=move-button-right]').eq(0).click({ force: true })
//             cy.wait(500)
//             // cy.get('body').click()
//             taskCellMenu.taskCellDropDownArrow().eq(1).click()
//             cy.wait(500)
//             taskCellMenu.archiveMenuText().click({ timeout: 10000 })
//             cy.wait(500)
//             cy.get('[data-test=action-dialog-button]').click()
//           })

//           it('The task is archived successfully', () => {
//             cy.get('[data-test=task-cell-test]').should('have.length', 2)
//           })
//         })
//       })
//     })
//   }
// )

// const triggerMouseOverForTask = taskName => {
//   getTaskCell(taskName).trigger('mouseover', {
//     force: true,
//   })
//   cy.wait(1000)
// }
// const getTaskCell = taskName =>
//   cy
//     .get('div')
//     .contains(new RegExp(`^${taskName}$`))
//     .scrollIntoView()
