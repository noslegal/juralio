// import {
//     generateFixture,
//     getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
// import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
// import {
//     checkTaskOrder,
//     doDragNoComplete,
//     generatePoint,
//     performTemplateDrag
// } from '../../taskmap/dnd/task-map-drag-helpers.cy'

// const Test1CellStartIndex = 4
// const Test2CellStartIndex = 6
// const Test3CellStartIndex = 8

// const visitHelpers = new VisitHelpers()

// describe('template_task_map_drag_and_drop_subtasks.cy', () => {
//   let user,
//     fixture,
//     appPage,
//     template,
//     newTemplateName = 'Test Template For DND',
//     template2

//   before(() => {
//     createKnowledgeManagerUser()
//       .then(createdUser => {
//         user = createdUser
//         const seed = {
//           matter: {
//             prefix: 'taskMapDNDTest',
//             teamMembers: [user],
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
//                       { name: 'Epsilon', tasks: [{}, {}, {}, {}] },
//                       { name: 'Zeta' },
//                       { name: 'Eta' },
//                       { name: 'Theta' },
//                       { name: 'Iota' },
//                       { name: 'Kappa' },
//                       { name: 'Lambda' },
//                       { name: 'Mu' },
//                     ],
//                   },
//                 ],
//               },
//               {
//                 tasks: [
//                   {
//                     name: 'Test 3',
//                     tasks: [
//                       { name: 'Epsilon', tasks: [{}, {}, {}, {}] },
//                       { name: 'Zeta', properties: { status: 'in-progress' } },
//                       { name: 'Eta', properties: { status: 'in-progress' } },
//                       { name: 'Theta', properties: { status: 'in-progress' } },
//                       { name: 'Iota' },
//                       { name: 'Kappa' },
//                       { name: 'Lambda' },
//                       { name: 'Mu' },
//                     ],
//                   },
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
//         createTemplate(newTemplateName, fixture.projects[1].id).then(
//           createdTemplate => {
//             template2 = createdTemplate
//           }
//         )
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
//     it('should set the correct document title', () => {
//       cy.title().should('contain', 'Templates')
//     })

//     describe('Test1 - basic subtask reorder', () => {
//       before(() => {
//         performTemplateDrag(Test1CellStartIndex + 1, generatePoint(500, 120))
//         cy.wait(1000)
//       })

//       checkTaskOrder(Test1CellStartIndex, ['Beta', 'Alpha', 'Gamma'])

//       describe('Test1 - subsequent subtask reorder', () => {
//         before(() => {
//           performTemplateDrag(Test1CellStartIndex + 1, generatePoint(500, 120))
//           cy.wait(1000)
//         })

//         checkTaskOrder(Test1CellStartIndex, ['Alpha', 'Beta', 'Gamma'])
//       })
//     })

//     describe('Test2 - Reorder of sole subtask does not result in change', () => {
//       before(() => {
//         performTemplateDrag(Test2CellStartIndex + 1, generatePoint(500, 30), {
//           wait: false,
//         })
//       })

//       checkTaskOrder(Test2CellStartIndex + 1, ['Delta'])
//     })

//     describe('Test3 - subtask with children reorder ', () => {
//       before(() => {
//         performTemplateDrag(Test3CellStartIndex + 1, generatePoint(540, 700))
//       })

//       checkTaskOrder(Test3CellStartIndex, [
//         'Epsilon',
//         'Eta',
//         'Theta',
//         'Iota',
//         'Kappa',
//         'Lambda',
//         'Zeta',
//         'Mu',
//       ])
//     })
//   })
//   describe('when navigating to the task map ', () => {
//     before(() => {
//       cy.login(user.username)
//       visitHelpers.visitTemplateTaskMap(template2.id)
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
//   })
// })
