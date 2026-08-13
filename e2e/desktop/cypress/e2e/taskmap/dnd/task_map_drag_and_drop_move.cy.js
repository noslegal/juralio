// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { performDrag, generatePoint } from './task-map-drag-helpers'

// const Test1CellStartIndex = 4

// const enterMoveMode = () => {
//   cy.get('[data-test=enterMoveMode]').click()
// }

// const taskCellColours = {
//   'not-started': 'rgb(225, 222, 216)',
//   'in-progress': 'rgb(244, 225, 186)',
//   done: 'rgb(194, 218, 214)',
//   undefined: 'rgb(206, 202, 237)', // Template task.
// }

// describe(
//   'task_map_drag_and_drop_move.cy',
//   { retries: { runMode: 2, openMode: 1 } },
//   () => {
//     let user, fixture, appPage, nonAdminUser

//     before(() => {
//       createUser().then(createdUser1 => {
//         nonAdminUser = createdUser1
//       })
//       createUser().then(createdUser => {
//         user = createdUser
//         const seed = {
//           matter: {
//             prefix: 'taskMapDNDTest',
//             teamMembers: [user, nonAdminUser],
//             matterAdmins: [user],
//             projects: [
//               {
//                 tasks: [
//                   {
//                     name: 'Test 1',
//                     tasks: [
//                       { name: 'Alpha' },
//                       { name: 'Beta' },
//                       { name: 'Gamma' },
//                     ],
//                   },
//                   {
//                     name: 'Test 2',
//                     tasks: [{ name: 'Delta' }],
//                   },
//                   {
//                     name: 'Test 3',
//                     tasks: [
//                       {
//                         name: 'Epsilon',
//                         tasks: [{}, {}, {}, {}, {}, {}, {}, {}],
//                       },
//                       { name: 'Zeta' },
//                       { name: 'Eta' },
//                       { name: 'Theta' },
//                       { name: 'Iota' },
//                       { name: 'Kappa' },
//                       { name: 'Lambda' },
//                       {
//                         name: 'Mu',
//                         tasks: [
//                           {
//                             name: 'a',
//                             tasks: [
//                               {
//                                 name: 'a',
//                                 tasks: [
//                                   {
//                                     name: 'a',
//                                     tasks: [
//                                       {
//                                         name: 'a',
//                                       },
//                                     ],
//                                   },
//                                 ],
//                               },
//                             ],
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                   {},
//                 ],
//               },
//             ],
//           },
//         }

//         fixture = generateFixture(seed)
//         appPage = getWrapper(fixture)
//       })
//     })

//     describe('when navigating to the task map', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap()
//       })

//       it('should set the correct document title', () => {
//         cy.title().should('eq', 'Project P1 | Juralio')
//       })
//     })
//     describe('when moving a task', () => {
//       before(() => {
//         performDrag(Test1CellStartIndex + 1, generatePoint(300, 70), {
//           wait: false,
//         })
//         enterMoveMode()
//       })
//       it('should display the task details in the header', () => {
//         cy.get('[data-test=cancelMoveButton]').should('be.visible')
//       })
//       it('should show the selected task and its children in a different colour', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(Test1CellStartIndex + 1)
//           .should('have.css', 'opacity')
//           .and('eq', '0.75')
//       })
//     })
//     describe('clicking the move help button', () => {
//       before(() => {
//         cy.get('[data-test=moveHeaderHelpText]').click()
//       })
//       it('should bring up the help menu', () => {
//         cy.get('#beacon-container')
//           .find('iframe')
//           .then($iframe => {
//             const $body = $iframe.contents().find('body')
//             cy.wrap($body).should('be.visible')
//           })
//       })
//     })
//     describe('when moving a task to a different parent', () => {
//       before(() => {
//         cy.reload()
//         cy.login(user.username)
//         appPage.visitTaskMap()
//         performDrag(Test1CellStartIndex + 1, generatePoint(300, 70), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(2).click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-test]')
//           .eq(Test1CellStartIndex)
//           .scrollIntoView()
//       })
//       it('should become a child of that parent', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(Test1CellStartIndex + 1)
//           .should('contain', 'Beta')
//       })
//     })
//     describe('when moving a task to a level A task', () => {
//       before(() => {
//         performDrag(Test1CellStartIndex + 11, generatePoint(300, 70), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(0).click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-test]')
//           .eq(Test1CellStartIndex)
//           .scrollIntoView()
//       })
//       it('should become a level A task', () => {
//         cy.get('[data-test=task-cell-test]').eq(4).should('contain', 'Mu')
//       })
//     })
//     describe('when moving a task to a new parent with children 6 deep', () => {
//       before(() => {
//         performDrag(5, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//       })
//       it('should not be possible to move to that position', () => {
//         cy.get('[data-test=move-button-right]').should('have.length', 24)
//       })
//     })
//     describe('when moving a task to a new parent with 8 children wide6', () => {
//       before(() => {
//         cy.get('[data-test=cancelMoveButton]').click()
//         performDrag(6, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//       })
//       it('should not be possible to move to that position', () => {
//         cy.get('[data-test=move-button-right]').should('have.length', 26)
//       })
//     })
//     describe('when moving an in-progress task into a done parent', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap()
//         appPage.changeTaskStatus('Beta', 1, true)
//         appPage.visitTaskMap()
//         performDrag(6, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(7).click()
//         cy.wait(2000)
//       })
//       it('should set the parent status to in-progress', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(8)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving an in-progress task into a not-started parent', () => {
//       before(() => {
//         performDrag(8, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=icicle-minimap-minimized]').click({ force: true })
//         cy.get('[data-test=move-button-right]').eq(2).click('center')
//         cy.wait(2000)
//       })
//       it('should set the parent status to in-progress', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(2)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving a done task to a not-started parent', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap()
//         appPage.changeTaskStatus('Beta', 2, false)
//         appPage.visitTaskMap()
//         performDrag(17, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(8).click('bottomRight')
//         cy.wait(2000)
//       })
//       it('should set the parent status to in-progress', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(7)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving a done task to a in-progress parent', () => {
//       before(() => {
//         performDrag(17, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(1).click('bottomRight')
//         cy.wait(2000)
//       })
//       it('should not change the parent status', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(1)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving a not-started task into an in-progress parent', () => {
//       before(() => {
//         performDrag(3, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(1).click('bottomRight')
//         cy.wait(2000)
//       })
//       it('should not change the parent status', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(1)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving a not-started task into an done parent', () => {
//       before(() => {
//         performDrag(9, generatePoint(300, 7000), {
//           wait: false,
//         })
//         enterMoveMode()
//         cy.get('[data-test=move-button-right]').eq(4).click('bottomRight')
//         cy.wait(2000)
//       })
//       it('should set the parent status to in-progress', () => {
//         cy.get('[data-test=task-cell-test]')
//           .eq(2)
//           .should('have.css', 'background-color')
//           .and('eq', taskCellColours['in-progress'])
//       })
//     })
//     describe('when moving a task', () => {
//       before(() => {
//         const point = generatePoint(300, 700)
//         cy.window().then(win => {
//           cy.get('[data-test=task-cell-test]')
//             .eq(12)
//             .trigger('mousedown', {
//               view: win,
//             })
//             .trigger('mousemove', {
//               clientX: point.x + point.offsetX,
//               clientY: point.y + point.offsetY,
//               force: true,
//             })
//         })
//       })
//       it('should be semi-transparent', () => {
//         cy.get('[data-test=cell]')
//           .eq(12)
//           .should('have.css', 'opacity')
//           .and('eq', '0.75')
//       })
//       describe('releasing the cell', () => {
//         before(() => {
//           cy.window().then(win => {
//             cy.get('[data-test=task-cell-test]').eq(12).trigger('mouseup', {
//               view: win,
//             })
//           })
//         })
//         it('should return to full opacity', () => {
//           cy.get('[data-test=cell]')
//             .eq(12)
//             .should('have.css', 'opacity')
//             .and('eq', '1')
//         })
//       })
//     })
//     describe('when an non-admin tries to move a task', () => {
//       before(() => {
//         cy.login(nonAdminUser.username)
//         appPage.visitTaskMap()
//         performDrag(6, generatePoint(300, 7000), {
//           wait: false,
//         })
//       })
//       it('should be able to move a task', () => {
//         cy.get('[data-test=enterMoveMode]').should('be.visible')
//       })
//     })
//   }
// )
