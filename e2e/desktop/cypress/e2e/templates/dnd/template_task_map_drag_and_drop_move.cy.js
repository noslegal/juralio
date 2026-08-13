// import {
//     generateFixture,
//     getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
// import {
//     createKnowledgeManagerUser, createUser
// } from '../../../../../helpers/users/user_api_helper'
// import {
//     generatePoint, performDrag
// } from '../../taskmap/dnd/task-map-drag-helpers.cy'

// const visitHelpers = new VisitHelpers()

// const Test1CellStartIndex = 4
// const Test2CellStartIndex = 6
// const Test3CellStartIndex = 8

// const enterMoveMode = () => {
//   cy.get('[data-test=enterMoveMode]').click()
// }

// describe('template_task_map_drag_and_drop_move.cy', () => {
//   let user,
//     fixture,
//     appPage,
//     nonAdminUser,
//     template,
//     newTemplateName = 'Test Template For DND'

//   before(() => {
//     createUser().then(createdUser1 => {
//       nonAdminUser = createdUser1
//     })
//     createKnowledgeManagerUser()
//       .then(createdUser => {
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
//       .then(() => {
//         cy.login(user.username)
//         createTemplate(newTemplateName, fixture.projects[0].id).then(
//           createdTemplate => {
//             template = createdTemplate
//             visitHelpers.visitTemplateTaskMap(template.id)
//           }
//         )
//       })
//   })

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//     })

//     it('should set the correct document title', () => {
//       cy.title().should('eq', 'Templates | Juralio')
//     })
//   })
//   describe('when moving a task', () => {
//     before(() => {
//       performDrag(Test1CellStartIndex + 1, generatePoint(300, 70), {
//         wait: false,
//       })
//       enterMoveMode()
//     })
//     it('should display the task details in the header', () => {
//       cy.get('[data-test=cancelMoveButton]').should('exist')
//     })
//     it('should show the selected task and its children in a different colour', () => {
//       cy.get('[data-test=task-cell-test]')
//         .eq(Test1CellStartIndex + 1)
//         .should('have.css', 'opacity')
//         .and('eq', '0.75')
//     })
//   })
//   describe('clicking the move help button', () => {
//     before(() => {
//       cy.get('[data-test=moveHeaderHelpText]').click({ force: true })
//     })
//     it('should bring up the help menu', () => {
//       cy.get('#beacon-container')
//         .find('iframe')
//         .then($iframe => {
//           const $body = $iframe.contents().find('body')
//           cy.wrap($body).should('be.visible')
//         })
//     })
//   })
//   describe('when moving a task to a different parent', () => {
//     before(() => {
//       cy.reload()
//       cy.login(user.username)
//       visitHelpers.visitTemplateTaskMap(template.id)
//       performDrag(Test1CellStartIndex + 1, generatePoint(300, 70), {
//         wait: false,
//       })
//       enterMoveMode()
//       cy.get('[data-test=move-button-right]').eq(2).click()
//       cy.wait(5000)
//       cy.get('[data-test=task-cell-test]')
//         .eq(Test1CellStartIndex)
//         .scrollIntoView()
//     })
//     it('should become a child of that parent', () => {
//       cy.get('[data-test=task-cell-test]')
//         .eq(Test1CellStartIndex + 1)
//         .should('contain', 'Beta')
//     })
//   })
//   describe('when moving a task to a level A task', () => {
//     before(() => {
//       performDrag(Test1CellStartIndex + 11, generatePoint(300, 70), {
//         wait: false,
//       })
//       enterMoveMode()
//       cy.get('[data-test=move-button-right]').eq(0).click()
//       cy.wait(5000)
//       cy.get('[data-test=task-cell-test]')
//         .eq(Test1CellStartIndex)
//         .scrollIntoView()
//     })
//     it('should become a level A task', () => {
//       cy.get('[data-test=task-cell-test]').eq(6).should('contain', 'Beta')
//     })
//   })
//   describe('when moving a task to a new parent with children 6 deep', () => {
//     before(() => {
//       performDrag(5, generatePoint(300, 7000), {
//         wait: false,
//       })
//       enterMoveMode()
//     })
//     it('should not be possible to move to that position', () => {
//       cy.get('[data-test=move-button-right]').should('have.length', 4)
//     })
//   })
//   describe('when moving a task to a new parent with 8 children wide', () => {
//     before(() => {
//       cy.get('[data-test=cancelMoveButton]').click({ force: true })
//       performDrag(6, generatePoint(300, 7000), {
//         wait: false,
//       })
//       enterMoveMode()
//     })
//     it('should not be possible to move to that position', () => {
//       cy.get('[data-test=move-button-right]').should('have.length', 26)
//     })
//   })
// })
