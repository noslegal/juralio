// import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../helpers/users/user_api_helper'
// import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'

// const visitHelpers = new VisitHelpers()

// describe('task_subtask_ordering_consistency.cy', () => {
//   let user, fixture

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'task_subtask_ordering_consistency.cy',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'A0',
//                   properties: {
//                     status: 'in-progress',
//                   },
//                   tasks: [
//                     {
//                       name: 'Done 1',
//                       properties: {
//                         status: 'done',
//                       },
//                     },
//                     {
//                       name: 'In Progress Without Children 1',
//                       properties: {
//                         status: 'in-progress',
//                       },
//                     },
//                     {
//                       name: 'In Progress Without Children 2',
//                       properties: {
//                         status: 'in-progress',
//                       },
//                     },
//                     {
//                       name: 'In Progress With Done Child',
//                       properties: {
//                         status: 'in-progress',
//                       },
//                       tasks: [
//                         {
//                           name: 'Starts Off Done',
//                           properties: {
//                             status: 'done',
//                           },
//                         },
//                         {
//                           name: 'Starts Off In Progress',
//                           properties: {
//                             status: 'in-progress',
//                           },
//                         },
//                       ],
//                     },
//                     {
//                       name: 'In Progress With Not Started Child',
//                       properties: {
//                         status: 'in-progress',
//                       },
//                       tasks: [
//                         {
//                           name: 'Starts Off Not Started',
//                           properties: {
//                             status: 'not-started',
//                           },
//                         },
//                         {
//                           name: 'Starts Off In Progress',
//                           properties: {
//                             status: 'in-progress',
//                           },
//                         },
//                       ],
//                     },
//                     {
//                       name: 'Not Started 1',
//                       properties: {
//                         status: 'not-started',
//                       },
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

//   describe('When visiting task details for the parent task', () => {
//     before(() => {
//       cy.login(user.username)
//       visitHelpers.visitTaskDetails(
//         fixture.matter.id,
//         fixture.projects[0].id,
//         fixture.tasks[0].id
//       )
//     })

//     it('should show the tasks in their initial expected order', () => {
//       cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//         .eq(0)
//         .should('contain', 'Done 1')
//       cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//         .eq(0)
//         .should('contain', 'In Progress Without Children 1')
//       cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//         .eq(1)
//         .should('contain', 'In Progress Without Children 2')
//       cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//         .eq(2)
//         .should('contain', 'In Progress With Done Child')
//       cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//         .eq(3)
//         .should('contain', 'In Progress With Not Started Child')
//       cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//         .eq(0)
//         .should('contain', 'Not Started 1')
//     })

//     describe("when dragging an in progress subtask without children into the first done subtask's position", () => {
//       before(() => {
//         cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as('updateTasks')
//         cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .drag()
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .drop()
//         cy.wait('@updateTasks')
//       })

//       it('should show the dragged subtask in the done subtasks with the expected order after drag & drop', () => {
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .should('contain', 'In Progress Without Children 1')
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(1)
//           .should('contain', 'Done 1')
//       })
//     })

//     describe("when dragging an in progress subtask without children into the first not started subtask's position", () => {
//       before(() => {
//         cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as('updateTasks')
//         cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .drag()
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .drop()
//         cy.wait('@updateTasks')
//       })

//       it('should show the dragged subtasks in the not started subtasks with the expected order after drag & drop', () => {
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .should('contain', 'In Progress Without Children 2')
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(1)
//           .should('contain', 'Not Started 1')
//       })
//     })

//     describe("when dragging an in progress subtask with a not started child into the first done subtask's position", () => {
//       describe('when the update is cancelled', () => {
//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
//             'updateTasks'
//           )
//           cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//             .eq(1)
//             .drag()
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .drop()
//           cy.wait('@updateTasks')
//           cy.tick(1000)
//         })

//         it('should display a dialog with the correct title', () => {
//           cy.get('[data-test=dialog-header-title-text]').should('be.visible')
//           cy.get('[data-test=dialog-header-title-text]').should(
//             'contain',
//             'Change Status: In Progress With Not Started Child'
//           )
//         })

//         describe('when cancel is pressed', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should restore the original task order', () => {
//             cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//               .eq(0)
//               .should('contain', 'In Progress With Done Child')
//             cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//               .eq(1)
//               .should('contain', 'In Progress With Not Started Child')
//           })
//         })
//       })

//       describe('when the update is confirmed', () => {
//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
//             'updateTasks'
//           )
//           cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//             .eq(1)
//             .drag()
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .drop()
//           cy.wait('@updateTasks')
//           cy.tick(1000)
//           cy.get('[data-test=action-dialog-button]').click()
//         })

//         it('should keep the dragged task in the done list', () => {
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .should('contain', 'In Progress With Not Started Child')
//         })
//       })
//     })

//     describe("when dragging an in progress subtask with a done child into the first not started subtask's position", () => {
//       describe('when the update is cancelled', () => {
//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
//             'updateTasks'
//           )
//           cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .drag()
//           cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//             .eq(1)
//             .drop()
//           cy.wait('@updateTasks')
//           cy.tick(1000)
//         })

//         it('should display a dialog with the correct title', () => {
//           cy.get('[data-test=dialog-header-title-text]').should('be.visible')
//           cy.get('[data-test=dialog-header-title-text]').should(
//             'contain',
//             'Change Status: In Progress With Done Child'
//           )
//         })

//         describe('when cancel is pressed', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should preserve the original in progress subtask', () => {
//             cy.get(
//               '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 1)
//             cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//               .eq(0)
//               .should('contain', 'In Progress With Done Child')
//           })
//         })
//       })

//       describe('when the update is confirmed', () => {
//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
//             'updateTasks'
//           )
//           cy.get('[data-test=in-progress-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .drag()
//           cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .drop()
//           cy.wait('@updateTasks')
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.tick(1000)
//         })

//         it('should keep the dragged task in the not started list', () => {
//           cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//             .eq(0)
//             .should('contain', 'In Progress With Done Child')
//         })
//       })
//     })

//     describe('when refreshing the page', () => {
//       before(() => {
//         cy.login(user.username)
//         visitHelpers.visitTaskDetails(
//           fixture.matter.id,
//           fixture.projects[0].id,
//           fixture.tasks[0].id,
//           true
//         )
//       })

//       it('should have persisted the new order', () => {
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//           'have.length',
//           3
//         )
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .should('contain', 'In Progress With Not Started Child')
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(1)
//           .should('contain', 'In Progress Without Children 1')
//         cy.get('[data-test=done-tasks] [data-test=task-cell-test]')
//           .eq(2)
//           .should('contain', 'Done 1')
//         cy.get(
//           '[data-test=not-started-tasks] [data-test=task-cell-test]'
//         ).should('have.length', 3)
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(0)
//           .should('contain', 'In Progress With Done Child')
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(1)
//           .should('contain', 'In Progress Without Children 2')
//         cy.get('[data-test=not-started-tasks] [data-test=task-cell-test]')
//           .eq(2)
//           .should('contain', 'Not Started 1')
//       })
//     })
//   })
// })
