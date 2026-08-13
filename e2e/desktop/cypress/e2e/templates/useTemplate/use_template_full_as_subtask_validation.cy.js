// import nameGenerator from 'project-name-generator'
// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { selectTemplateProjectAndConfirm } from '../../../../../helpers/templates/project_from_template_helper'
// import {
//   createTemplate,
//   publishTemplate,
// } from '../../../../../helpers/templates/template_api_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

// describe('use_template_full_as_subtask_validation.cy', () => {
//   let user, fixture, newTemplate
//   const visitHelpers = new VisitHelpers()
//   const newTemplateName = nameGenerator.generate().spaced

//   before(() => {
//     createUser('TEST', true, true, {
//       roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
//     }).then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'UseTemplate ',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'MOON - A',
//                   tasks: [{}, {}, {}, {}, {}, {}, {}, {}],
//                 },
//                 {
//                   name: 'SUN - A',
//                   tasks: [
//                     {
//                       name: 'SUN - B',
//                       tasks: [
//                         {
//                           name: 'SUN - C',
//                           tasks: [
//                             {
//                               name: 'SUN - D',
//                               tasks: [
//                                 {
//                                   name: 'SUN - E',
//                                   tasks: [{ name: 'SUN - F' }],
//                                 },
//                               ],
//                             },
//                           ],
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//     })
//   })

//   describe('When trying to use template task as a subtask of - ', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(newTemplateName, fixture.projects[0].id)
//         .then(template => {
//           newTemplate = template
//         })
//         .then(() => {
//           publishTemplate(newTemplate.id)
//           visitHelpers.visitTemplateOverview(newTemplate.id)
//         })

//       it('should have map displayed', () => {
//         cy.get('[data-test=container]').should('have.length', 1)
//       })
//     })

//     describe('a parent which already has 8 subtasks', () => {
//       before(() => {
//         selectTemplateProjectAndParentTask('MOON - A')
//       })

//       it(
//         'should display subtasks limit validation message',
//         { retries: { runMode: 2, openMode: 1 } },
//         () => {
//           templateSourceDialogPage.get
//             .taskSelector()
//             .contains('Tasks cannot have more than 8 subtasks.')
//         }
//       )
//     })

//     describe('a parent which does NOT have enough level depths', () => {
//       before(() => {
//         cy.login(user.username)
//         visitHelpers.visitTemplateOverview(newTemplate.id)
//         selectTemplateProjectAndParentTask('SUN - E')
//       })

//       it('should display level limit validation message', () => {
//         templateSourceDialogPage.get
//           .taskSelector()
//           .contains('Tasks cannot have more than 6 levels.')
//       })
//     })
//   })

//   const selectTemplateProjectAndParentTask = parentTaskName => {
//     selectTemplateProjectAndConfirm()
//     cy.get('[data-test=existing-project-radio]').click()

//     templateSourceDialogPage.get.matterSelector().click()
//     cy.focused().type('UseTemplate')
//     cy.backendRoute(
//       '/matter/*/workstreams?excludeClosed=true&levelATasksOnly=false'
//     ).as('projectsFetch')
//     templateSourceDialogPage.get.matterSelectorItem().first().click()

//     cy.get('[data-test=destination-select]').click()
//     cy.wait(5000)

//     templateSourceDialogPage.get.subtaskOf().last().click({ timeout: 30000 })

//     cy.backendRoute('GET', '/matter/*/workstreams/*/tasks**').as('tasksFetch')
//     templateSourceDialogPage.get
//       .taskSelectorInput()
//       .click()
//       .type(parentTaskName)
//     cy.wait('@tasksFetch')
//     templateSourceDialogPage.get.taskSelectorItem().first().click()
//   }
// })
