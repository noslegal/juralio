// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// const visitHelpers = new VisitHelpers()

// describe('project_overview_level_a_tasks_consistency.cy', () => {
//   let testUser, fixture, matter, project

//   before(() => {
//     createUser()
//       .then(createdUser => {
//         testUser = createdUser
//         const statuses = ['done', 'in-progress', 'not-started']
//         const seed = {
//           matter: {
//             teamMembers: [testUser],
//             matterAdmins: [testUser],
//             projects: [
//               {
//                 name: 'Overview Spec with Tasks',
//                 // 2 tasks of each status, each with a child of same status
//                 tasks: Array.from({ length: 6 }, (v, i) => ({
//                   name: `Task${i + 1}`,
//                   tasks: [
//                     {
//                       name: `Child${i + 1}`,
//                       properties: { status: statuses[i >> 1] },
//                     },
//                   ],
//                   properties: { status: statuses[i >> 1] },
//                 })),
//               },
//             ],
//           },
//         }
//         fixture = generateFixture(seed)
//       })
//       .then(() => {
//         matter = fixture.matter
//         project = fixture.projects[0]
//       })
//   })

//   const openMenuForTask = taskName =>
//     cy
//       .get('[data-test=task-cell-test]')
//       .contains(taskName)
//       .closest('[data-test=task-cell-test]')
//       .find('[data-test=options-dropdown]')
//       .eq(0)
//       .click()

//   describe('When navigating to project overview with tasks', () => {
//     before(() => {
//       cy.login(testUser.username)
//       visitHelpers.visitProjectOverview(matter.id, project.id)
//     })

//     describe('when the drawer is expanded', () => {
//       before(() => {
//         cy.get('[data-test=level-a-tasks-drawer-arrow-left]').click({
//           force: true,
//         })
//       })

//       describe('When setting a done task to not-started via the menu', () => {
//         const targetTask = 'Task1'

//         before(() => {
//           openMenuForTask(targetTask)
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=menu-text]')
//             .contains('Set to not started')
//             .click()
//           cy.wait('@patchProject')
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get(
//             '[data-test=not-started-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 3)
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//             'have.length',
//             1
//           )
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 2)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               2
//             )
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             openMenuForTask(targetTask)
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=menu-text]')
//               .contains('Set to not started')
//               .click()
//             cy.wait('@patchProject')
//             cy.get('[data-test=action-dialog-button]').click()
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 3)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               1
//             )
//           })
//         })
//       })

//       describe('When setting a done task to not-started via drag and drop', () => {
//         const targetTask = 'Task2'

//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=task-cell-test]')
//             .contains(targetTask)
//             .drag()
//           cy.get('[data-test=not-started-tasks]').drop()
//           cy.wait('@patchProject')
//           cy.tick(1000)
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get(
//             '[data-test=not-started-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 4)
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//             'have.length',
//             0
//           )
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 3)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               1
//             )
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=task-cell-test]')
//               .contains(targetTask)
//               .drag()
//             cy.get('[data-test=not-started-tasks]').drop()
//             cy.wait('@patchProject')
//             cy.tick(1000)
//             cy.get('[data-test=action-dialog-button]').click()
//             cy.tick(1000)
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 4)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               0
//             )
//           })
//         })
//       })

//       describe('When setting an in-progress task to done via the menu', () => {
//         const targetTask = 'Task3'

//         before(() => {
//           openMenuForTask(targetTask)
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=menu-text]')
//             .contains('Set to done')
//             .click()
//           cy.wait('@patchProject')
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//             'have.length',
//             1
//           )
//           cy.get(
//             '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 1)
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               0
//             )
//             cy.get(
//               '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 2)
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             openMenuForTask(targetTask)
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=menu-text]')
//               .contains('Set to done')
//               .click()
//             cy.wait('@patchProject')
//             cy.get('[data-test=action-dialog-button]').click()
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 1)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               1
//             )
//           })
//         })
//       })

//       describe('When setting an in-progress task to not-started via drag and drop', () => {
//         const targetTask = 'Task4'

//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=task-cell-test]')
//             .contains(targetTask)
//             .drag()
//           cy.get('[data-test=not-started-tasks]').drop()
//           cy.wait('@patchProject')
//           cy.tick(1000)
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get(
//             '[data-test=not-started-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 5)
//           cy.get(
//             '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 0)
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 4)
//             cy.get(
//               '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 1)
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=task-cell-test]')
//               .contains(targetTask)
//               .drag()
//             cy.get('[data-test=not-started-tasks]').drop()
//             cy.wait('@patchProject')
//             cy.tick(1000)
//             cy.get('[data-test=action-dialog-button]').click()
//             cy.tick(1000)
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 5)
//             cy.get(
//               '[data-test=in-progress-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 0)
//           })
//         })
//       })

//       describe('When setting an not-started task to done via the menu', () => {
//         const targetTask = 'Task5'

//         before(() => {
//           openMenuForTask(targetTask)
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=menu-text]')
//             .contains('Set to done')
//             .click()
//           cy.wait('@patchProject')
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//             'have.length',
//             2
//           )
//           cy.get(
//             '[data-test=not-started-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 4)
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               1
//             )
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 5)
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             openMenuForTask(targetTask)
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=menu-text]')
//               .contains('Set to done')
//               .click()
//             cy.wait('@patchProject')
//             cy.get('[data-test=action-dialog-button]').click()
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               2
//             )
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 4)
//           })
//         })
//       })

//       describe('When setting an not-started task to done via drag and drop', () => {
//         const targetTask = 'Task6'

//         before(() => {
//           cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//           cy.get('[data-test=task-cell-test]')
//             .contains(targetTask)
//             .drag()
//           cy.get('[data-test=done-tasks]').drop()
//           cy.tick(1000)
//           cy.wait('@patchProject')
//         })

//         it('should show the task with the new status in the level A tasks panel', () => {
//           cy.get(
//             '[data-test=not-started-tasks] [data-test=task-cell-test]'
//           ).should('have.length', 3)
//           cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//             'have.length',
//             3
//           )
//         })

//         it('should display a confirmation dialog', () => {
//           cy.get('[data-test=dialog-header-title-text]')
//             .should('be.visible')
//             .should('have.text', `Change Status: ${targetTask}`)
//         })

//         describe('when the change is canceled', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should show the task with the original status in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 4)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               2
//             )
//           })
//         })

//         describe('When the change is confirmed', () => {
//           before(() => {
//             cy.backendRoute('PATCH', '/matter/*/workstreams/**').as('patchProject')
//             cy.get('[data-test=task-cell-test]')
//               .contains(targetTask)
//               .drag()
//             cy.get('[data-test=done-tasks]').drop()
//             cy.wait('@patchProject')
//             cy.tick(1000)
//             cy.get('[data-test=action-dialog-button]').click()
//             cy.tick(1000)
//           })

//           it('should show the task with the new statuses in the level A tasks panel', () => {
//             cy.get(
//               '[data-test=not-started-tasks] [data-test=task-cell-test]'
//             ).should('have.length', 3)
//             cy.get('[data-test=done-tasks] [data-test=task-cell-test]').should(
//               'have.length',
//               3
//             )
//           })
//         })
//       })
//     })
//   })
// })
