// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { createTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'

// describe('task_linking.cy', () => {
//   let user, appPage, fixture

//   before(() => {
//     cy.window().then(win => {
//       win.sessionStorage.clear()
//     })

//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'TaskLinking',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'a',
//               tasks: [
//                 { name: 'a', properties: { status: 'done' } },
//                 { name: 'b' },
//                 { name: 'c' },
//                 { name: 'd' },
//               ],
//             },
//             {
//               name: 'b',
//               tasks: [
//                 { name: 'a', properties: { status: 'done' } },
//                 { name: 'b' },
//                 { name: 'c' },
//                 { name: 'd' },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('when visiting the taskmap', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('.reactour__close').click()
//     })
//     it('should not have linked tasks by default', () => {
//       cy.get('[data-test=dates-linked-icon]').should('not.exist')
//     })
//     describe('when linking a task', () => {
//       before(() => {
//         cy.get('[data-test=options-dropdown]').eq(0).click()
//       })
//       it('should display ther correct options text', () => {
//         cy.get('[data-test=menu-text-link]').should(
//           'have.text',
//           'Add task link'
//         )
//       })
//       describe('it should update the taskmap', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('linkUpdate')
//           cy.get('[data-test=menu-text-link]').click()
//           cy.get('[data-test=link-button-false]').click({
//             multiple: true,
//             force: true,
//           }) //link all tasks
//           cy.get('[data-test=action-dialog-button]').click({ timeout: 10000 })
//           cy.wait('@linkUpdate')

//           cy.get('[data-test=minimised-filters]').click({ force: true })
//           cy.get('[data-test=done-checkbox]').click()
//           // cy.get('body').click()
//           cy.wait(1000)
//         })
//         // it('should show the link icon', () => {
//         //   cy.get('[data-test=dates-linked-icon]').should('have.length', 3)
//         // })
//         it('should not show it on the done task', () => {
//           cy.get('[data-test=task-cell-test]')
//             .eq(0)
//             .find('[data-test=dates-linked-icon]')
//             .should('not.exist')
//         })
//         describe('upate the options menu', () => {
//           before(() => {
//             cy.get('body').click()
//             cy.get('[data-test=options-dropdown]')
//               .eq(2)
//               .click({ timeout: 10000 })

//             cy.get('[data-test=task-card-option-menu]', {
//               timeout: 10000,
//             }).should('be.visible')
//           })
//           it('should update the options menu', () => {
//             cy.get('[data-test=menu-text-linkedit]').should(
//               'have.text',
//               'Add or edit task link'
//             )
//           })
//         })
//       })
//     })
//   })
//   describe('when in the task overview', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap(1)
//       cy.get('[data-test=task-cell-test]')
//         .eq(0)
//         .find('[data-test=name]')
//         .click()
//     })
//     it('should show the default link state', () => {
//       cy.get('[data-test=add-links-button]', { timeout: 10000 }).should('exist')
//     })
//     describe('when the siblings are linked', () => {
//       before(() => {
//         cy.get('[data-test=add-links-button]').click()
//         cy.get('[data-test=link-button-false]').click({
//           multiple: true,
//           force: true,
//         }) //link all tasks
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('linkUpdate')
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait('@linkUpdate')
//       })
//       it('should show how many siblings are linked', { retires: 3 }, () => {
//         cy.get('[data-test=add-links-button]', { timeout: 10000 }).should(
//           'contain',
//           '2'
//         )
//       })
//     })
//   })
//   describe('moving linked level A tasks', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap(1)
//       cy.get('[data-test=task-cell-date-picker-start]').eq(0).click()
//       cy.backendRoute(
//         '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//       ).as('dateUpdate')
//       cy.get('button').contains(new RegExp('^2$')).click({ force: true })
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-date-picker-start]', { timeout: 10000 })
//         .eq(1)
//         .click({ timeout: 10000 })
//       cy.get('button').contains(new RegExp('^2$')).click({ force: true })
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-date-picker-start]').eq(2).click()
//       cy.get('button').contains(new RegExp('^2$')).click({ force: true })
//       cy.wait(5000)
//     })
//     it('should have some start dates', () => {
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(0)
//         .should('contain.text', '2 ')
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(1)
//         .should('contain.text', '2 ')
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(2)
//         .should('contain.text', '2 ')
//     })
//     describe('updating a task start date', () => {
//       before(() => {
//         cy.get('[data-test=task-cell-date-picker-start]').eq(0).click()
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('button').contains(new RegExp('^3$')).click()
//         cy.wait(1000)
//       })
//       it('should update the dates', { retires: 3 }, () => {
//         cy.get('[data-test=task-cell-date-picker-start]', { timeout: 10000 })
//           .eq(0)
//           .should('contain.text', '3 ')
//         cy.get('[data-test=task-cell-date-picker-start]', { timeout: 10000 })
//           .eq(1)
//           .should('contain.text', '3 ')
//         cy.get('[data-test=task-cell-date-picker-start]', { timeout: 10000 })
//           .eq(2)
//           .should('contain.text', '3 ')
//       })
//     })
//     describe('when there there are end dates', () => {
//       before(() => {
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(0)
//           .click()
//         cy.get('button').contains(new RegExp('^3$')).click()

//         cy.wait(1000)
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(1)
//           .click()
//         cy.get('button').contains(new RegExp('^3$')).click()

//         cy.wait(1000)
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(2)
//           .click()
//         cy.get('button').contains(new RegExp('^3$')).click()
//         cy.wait(1000)
//       })
//       it('should have some start dates', () => {
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(0)
//           .should('contain.text', '3')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(1)
//           .should('contain.text', '3')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(2)
//           .should('contain.text', '3')
//       })
//       describe('updating a task start date', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=task-cell-date-picker-end]').eq(2).click()
//           cy.get('button').contains(new RegExp('^3$')).click()
//           cy.wait(1000)
//         })
//         it('should update the dates', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(0)
//             .should('contain.text', '3 ')
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(1)
//             .should('contain.text', '3 ')
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(2)
//             .should('contain.text', '3 ')
//         })
//       })

//       describe('updating a task should not show a snackbar when no linked tasks are moved', () => {
//         before(() => {
//           cy.login(user.username).then(() => {
//             createTask(
//               fixture.matter.id,
//               fixture.projects[1].id,
//               'not-started',
//               'added task'
//             ).then(() => {
//               cy.login(user.username)
//               appPage.visitTaskMap(1)
//               cy.get('[data-test=task-cell-date-picker-start]').eq(3).click()
//               cy.get('button')
//                 .contains(new RegExp('^3$'))
//                 .click({ force: true })
//               cy.wait(1000)
//             })
//           })
//         })
//         it('should not show a snackbar', () => {
//           cy.get('[data-test=snackbar-message]').should('not.exist')
//         })
//       })
//     })
//   })
// })
