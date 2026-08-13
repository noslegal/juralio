// import nameGenerator from 'project-name-generator'
// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
// import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
// import {
//   checkTaskOrder,
//   generatePoint,
//   performTemplateDrag
// } from '../../taskmap/dnd/task-map-drag-helpers.cy'

// const newTemplateName = nameGenerator.generate().spaced
// const visitHelpers = new VisitHelpers()

// describe('template_task_map_drag_drop_level_a_reorder.cy', () => {
//   let user, fixture, newTemplate

//   before(() => {
//     createKnowledgeManagerUser().then(createdUser => {
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
//     })
//   })

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
//         newTemplate = template
//         visitHelpers.visitTemplateTaskMap(template.id)
//       })
//     })

//     describe('Drag second task to the top', () => {
//       before(() => {
//         performTemplateDrag(2, generatePoint(30, 10))
//       })
//       checkTaskOrder(1, ['Test 2', 'Test 1', 'Test 3'])
//     })
//   })

//   describe('Drag the third task into second place', () => {
//     before(() => {
//       performTemplateDrag(3, generatePoint(70, 150))
//     })
//     checkTaskOrder(1, ['Test 2', 'Test 3', 'Test 1'])
//   })

//   describe('Drag the top task to the bottom', () => {
//     before(() => {
//       // cy.get('.reactour__close').click({ force: true })
//       performTemplateDrag(1, generatePoint(430, 350))
//     })
//     checkTaskOrder(1, ['Test 3', 'Test 1', 'Test 2'])
//   })

//   describe('Dragging a level A item to the right', () => {
//     before(() => {
//       performTemplateDrag(1, generatePoint(3000, 110), { wait: false })
//     })
//     checkTaskOrder(1, ['Test 3', 'Test 1', 'Test 2'])
//   })

//   describe('Drag should persist accross reloads', () => {
//     before(() => {
//       cy.reload()
//       cy.login(user.username)
//       visitHelpers.visitTemplateTaskMap(newTemplate.id)
//     })
//     checkTaskOrder(1, ['Test 3', 'Test 1', 'Test 2'])
//   })
// })
