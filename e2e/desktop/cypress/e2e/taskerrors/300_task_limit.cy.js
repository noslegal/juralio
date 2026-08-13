// import { v4 as uuidv4 } from 'uuid'
// import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
// import { createUser } from '../../../../helpers/users/user_api_helper'
// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import { createTaskFromFab } from '../../../../helpers/tasks/task_create_helper'
// import snackbarHelper from '../../../../helpers/snackbar/snackbar-helper'
// import { createTemplate } from '../../../../helpers/templates/template_api_helper'

// describe('300_task_limit.cy', () => {
//   let user, fixture, template1
//   const visitHelpers = new VisitHelpers()

//   before(() => {
//     // eslint-disable-next-line arrow-parens
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: '300_task_limit',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   tasks: [
//                     {
//                       tasks: [
//                         {
//                           tasks: [
//                             {
//                               tasks: [
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                               ],
//                             },
//                             {
//                               tasks: [
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                               ],
//                             },
//                             {
//                               tasks: [
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                                 { tasks: [{}, {}, {}] },
//                                 {},
//                                 {},
//                                 {},
//                                 {},
//                               ],
//                             },
//                             { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                             { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                             { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                             { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                             { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                           ],
//                         },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                         { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
//                       ],
//                     },
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                     [{ tasks: [{}, {}, {}, {}, {}, {}, {}, {}] }],
//                   ],
//                 },
//               ],
//             },
//             { tasks: [{}, {}, {}] },
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//     })
//   })

//   describe('when navigate to taskmap with 300 tasks', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//     })

//     it('should not show add task on hover', () => {
//       cy.get('[data-test=task-cell-test]').eq(300).trigger('mouseover', {
//         force: true,
//       })
//       cy.get('[data-test=data-create-task-hover-button]').should('not.exist')
//     })
//   })

//   describe('when adding a task through the taskmap', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//       cy.get('[data-test=fab-button]').click()
//       cy.get('[data-test=create-task-button]').click()
//       cy.get('[data-test=text-prompt-text-field]').type('301 task')
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait(5000)
//       cy.get('[data-test=destination-type-selection-dropdown]').click()
//       cy.get('[data-test=destination-level-a]').click()
//       cy.get('[data-test=action-dialog-button]').click()
//     })

//     it('should not allow you to add another task', () => {
//       cy.get('[data-test=error-box]').should('exist')
//     })
//   })

//   describe('when trying to copy a task but 300 tasks exist', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//       cy.get('[data-test=options-dropdown]').eq(299).click()
//       cy.get('[data-test=menu-text-copy]').click()
//       cy.get('[data-test=new-task-name-text-field]').type('copy task')
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait(1000)
//     })

//     it('should not allow you to add another task', () => {
//       snackbarHelper.checkShownAndHasExpectedText(
//         'Maximum project size (300 tasks) reached. You can move tasks to another project or archive unneeded tasks.'
//       )
//       cy.get('[data-test=options-dropdown]').eq(301).should('not.exist')
//     })
//   })

//   describe('when trying to move a task into a project with 300 tasks', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[1].id}/taskmap`
//       )
//       cy.get('[data-test=options-dropdown]').eq(2).click()
//       cy.get('[data-test=menu-text-move]').click()
//       cy.get('[data-test=destination-selection-dropdown]').click()
//       cy.get('[data-test=destination-another-project]').click()
//       cy.wait(5000)
//       cy.get('[data-test=auto-complete-search-term]')
//         .eq(1)
//         .type(fixture.projects[0].name)
//       cy.get('[data-test=workstream-item-name]').click()
//       cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
//       cy.get('[data-test=destination-level-a]').click()
//       cy.get('[data-test=action-dialog-button]').click()
//     })
//     it('should not allow you to add another task', () => {
//       cy.get('[data-test=task-move-error]').should('exist')
//     })
//   })

//   describe('when trying to restore to the taskmap but 300 tasks exist', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//       cy.get('[data-test=options-dropdown]').eq(299).click()
//       cy.get('[data-test=menu-text-archive]').click()
//       cy.get('[data-test=action-dialog-button]').click()
//       createTaskFromFab('fab task', true)
//       cy.get('[data-test=destination-type-selection-dropdown]').click()
//       cy.get('[data-test=destination-level-a]').click()
//       cy.get('[data-test=action-dialog-button]').click()

//       visitHelpers.visitArchiveTable(user, fixture.matter.id)
//       cy.get('[data-rowindex=5] [data-colindex=0]').click()
//       cy.get('[data-test=action-dialog-button]').click()
//     })

//     it('should not allow you to add another task', () => {
//       cy.get('[data-test=error-message]').should('exist')
//     })
//   })

//   describe('a template can have a maximum of 300 tasks', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(uuidv4(), fixture.projects[0].id).then(template => {
//         template1 = template
//       })
//     })

//     before(() => {
//       visitHelpers.visitTemplateTaskMap(template1.id)
//       cy.get('[data-test=fab-button]').click()
//       cy.get('[data-test=create-template-task-button]').click()
//       cy.get('[data-test=text-prompt-text-field]').type('301 task')
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.get('[data-test=destination-type-selection-dropdown]').click()
//       cy.get('[data-test=destination-level-a]').click()
//       cy.get('[data-test=action-dialog-button]').click()
//     })
//     describe('when trying to add another task', () => {
//       it('should not allow you to add another task', () => {
//         cy.get('[data-test=error-box]').should('exist')
//         cy.get('[data-test=cancel-dialog-button]').click()
//       })
//     })

//     describe('when trying to copy a task in the full template', () => {
//       before(() => {
//         cy.login(user.username)
//         cy.get('[data-test=options-dropdown]').eq(299).click()
//         cy.get('[data-test=menu-text-copy]').click()
//         cy.get('[data-test=new-task-name-text-field]').type('copy task')
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(1000)
//       })

//       it('should not allow you to add another task', () => {
//         snackbarHelper.checkShownAndHasExpectedText(
//           'Maximum template size (300 tasks) reached.'
//         )
//         cy.get('[data-test=options-dropdown]').eq(300).should('not.exist')
//       })
//     })

//     describe('when trying to use the template', () => {
//       before(() => {
//         cy.login(user.username)
//         visitHelpers.visitTemplateOverview(template1.id)
//         cy.get('[data-test=use-template-button]').click()
//         cy.get('[data-test=action-dialog-button]').click()
//       })

//       describe('using the full template as level A', () => {
//         before(() => {
//           cy.get('[data-test=existing-project-radio]').click()

//           cy.get('[data-test=auto-complete-search-term]')
//             .eq(1)
//             .type(fixture.matter.name)
//           cy.get('[data-test=matter-select-menu-item]').click()
//           cy.wait(5000)
//           cy.get('[data-test=auto-complete-search-term]')
//             .eq(2)
//             .type(fixture.projects[0].name)
//           cy.get('[data-test=workstream-item-name]').click()
//           cy.get('[data-test=destination-type-selection-dropdown]').click()
//           cy.get('[data-test=destination-level-a]').click()
//           cy.get('[data-test=action-dialog-button]').click()
//         })

//         it('it stops the user from using the template', () => {
//           snackbarHelper.checkShownAndHasExpectedText(
//             'Maximum template size (300 tasks) reached.'
//           )
//         })
//       })

//       describe('using part of the template as level A', () => {
//         before(() => {
//           cy.get('[data-test=use-template-button]').click()
//           cy.get('[data-test=use-partial-template-radio]').click()
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.get('[data-test=task-cell-test]').eq(300).click()
//           cy.get('[data-test=confirm-selection-button]').click()

//           cy.get('[data-test=existing-project-radio]').click()
//           cy.get('[data-test=auto-complete-search-term]')
//             .eq(1)
//             .type(fixture.matter.name)
//           cy.get('[data-test=matter-select-menu-item]').click()
//           cy.wait(5000)
//           cy.get('[data-test=auto-complete-search-term]')
//             .eq(2)
//             .type(fixture.projects[0].name)
//           cy.get('[data-test=workstream-item-name]').click()
//           cy.get('[data-test=destination-type-selection-dropdown]').click()
//           cy.get('[data-test=destination-level-a]').click()
//           cy.get('[data-test=action-dialog-button]').click()
//         })

//         it('it stops the user from using the template', () => {
//           snackbarHelper.checkShownAndHasExpectedText(
//             'Maximum template size (300 tasks) reached.'
//           )
//         })
//       })
//     })
//   })
// })
