// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'

// describe('task_linking_part_2', () => {
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
//               tasks: [],
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
//             {
//               name: 'c',
//               tasks: [
//                 { name: 'a', properties: { status: 'done' } },
//                 {
//                   name: 'b',
//                   tasks: [{ name: 'c' }, { name: 'd' }, { name: 'e' }],
//                 },
//               ],
//             },
//             {
//               name: 'd',
//               tasks: [
//                 {
//                   name: 'b',
//                   properties: { plannedStartDate: new Date(2000, 2, 2) },
//                   tasks: [
//                     {
//                       name: 'c',
//                       properties: {
//                         plannedStartDate: new Date(2000, 2, 3),
//                         plannedEndDate: new Date(2000, 2, 4),
//                         datesLinkedToSiblings: true,
//                       },
//                     },
//                     {
//                       name: 'd',
//                       properties: {
//                         plannedStartDate: new Date(2000, 2, 4),
//                         plannedEndDate: new Date(2000, 2, 16),
//                         datesLinkedToSiblings: true,
//                       },
//                     },
//                     {
//                       name: 'e',
//                       properties: {
//                         plannedStartDate: new Date(2000, 2, 5),
//                         plannedEndDate: new Date(2000, 2, 12),
//                         datesLinkedToSiblings: true,
//                       },
//                     },
//                   ],
//                 },
//                 {
//                   name: 'f',
//                   tasks: [
//                     {
//                       name: 'g',
//                       properties: {
//                         plannedStartDate: new Date(2000, 2, 4),
//                         plannedEndDate: new Date(2000, 2, 16),
//                         datesLinkedToSiblings: true,
//                       },
//                     },
//                     {
//                       name: 'h',
//                       properties: {
//                         plannedStartDate: new Date(2000, 2, 5),
//                         plannedEndDate: new Date(2000, 2, 6),
//                         datesLinkedToSiblings: true,
//                       },
//                     },
//                   ],
//                 },
//               ],
//             },
//             {
//               name: 'e',
//               tasks: [
//                 {
//                   name: '1',
//                   tasks: [
//                     {
//                       name: '4',
//                       properties: {
//                         plannedStartDate: new Date(2000, 1, 1),
//                         plannedEndDate: new Date(2000, 1, 2),
//                       },
//                     },
//                     {
//                       name: '5',
//                       properties: {
//                         plannedStartDate: new Date(2000, 1, 1),
//                         plannedEndDate: new Date(2000, 1, 2),
//                       },
//                     },
//                     {
//                       name: '6',
//                       properties: {
//                         plannedStartDate: new Date(2000, 1, 1),
//                         plannedEndDate: new Date(2000, 1, 2),
//                       },
//                     },
//                   ],
//                   properties: {
//                     plannedStartDate: new Date(2000, 1, 1),
//                     plannedEndDate: new Date(2000, 1, 2),
//                   },
//                 },
//                 {
//                   name: '2',
//                   properties: {
//                     plannedStartDate: new Date(2000, 1, 1),
//                     plannedEndDate: new Date(2000, 1, 2),
//                   },
//                 },
//                 {
//                   name: '3',
//                   properties: {
//                     plannedStartDate: new Date(2000, 1, 1),
//                     plannedEndDate: new Date(2000, 1, 2),
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('moving linked subtasks tests', () => {
//     before(() => {
//       cy.backendRoute(
//         '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//       ).as('dateUpdate')
//       cy.login(user.username)
//       appPage.visitTaskMap(2)
//       cy.get('[data-test=options-dropdown]').eq(1).click()
//       cy.get('[data-test=menu-text-link]').click()
//       cy.get('[data-test=link-button-false]').eq(0).click() // link all tasks
//       cy.get('[data-test="dialog-header-title-text"]').click()
//       cy.get('[data-test=link-button-false]').eq(0).click()
//       cy.backendRoute(
//         '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//       ).as('linkUpdate')
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait('@linkUpdate')
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-date-picker-start]').eq(1).click()
//       cy.get('button').contains(new RegExp('^2$')).click()

//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait('@linkUpdate')
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-date-picker-start]').eq(2).click()
//       cy.get('button').contains(new RegExp('^2$')).click()
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-date-picker-start]').eq(3).click()
//       cy.get('button').contains(new RegExp('^2$')).click()
//       cy.wait(1000)
//     })
//     it('should have some start dates', () => {
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(1)
//         .should('contain.text', '2 ')
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(2)
//         .should('contain.text', '2 ')
//       cy.get('[data-test=task-cell-date-picker-start]')
//         .eq(3)
//         .should('contain.text', '2 ')
//     })
//     describe('updating a task start date', () => {
//       before(() => {
//         cy.get('[data-test=task-cell-date-picker-start]').eq(1).click()
//         cy.get('button').contains(new RegExp('^3$')).click()
//         cy.wait(1000)
//       })
//       it('should update the dates', () => {
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(1)
//           .should('contain.text', '3 ')
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(1)
//           .should('contain.text', '3 ')
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(2)
//           .should('contain.text', '3 ')
//       })
//     })
//     describe('when there there are end dates', () => {
//       before(() => {
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('[data-test=task-cell-date-picker-end]').eq(0).click()
//         cy.get('button').contains(new RegExp('^4$')).click()
//         cy.wait(5000)
//         cy.get('[data-test=task-cell-date-picker-end]').eq(1).click()
//         cy.get('button').contains(new RegExp('^4$')).click()
//         cy.wait(5000)
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(2)
//           .click({ timeout: 10000 })
//         cy.get('button').contains(new RegExp('^4$')).click()
//         cy.wait(5000)
//       })
//       it('should have some start dates', () => {
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(0)
//           .should('contain.text', '4')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(1)
//           .should('contain.text', '4')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(2)
//           .should('contain.text', '4')
//       })
//       describe('updating a task start date', () => {
//         before(() => {
//           cy.get('[data-test=task-cell-date-picker-end]').eq(2).click()
//           cy.get('button').contains(new RegExp('^3$')).click()
//         })
//         it('should update the dates', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(1)
//             .should('contain.text', '3 ')
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(2)
//             .should('contain.text', '3 ')
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(3)
//             .should('contain.text', '3 ')
//         })
//       })
//     })
//     describe('when moving would cause an invalid parent date order', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap(3)
//         cy.get('[data-test=task-cell-date-picker-start]').eq(2).click()
//         cy.get('button').contains(new RegExp('^2$')).click()
//         cy.wait(1000)
//       })
//       it('should display a modal', () => {
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//       })
//       describe('clicking confirm on the modal', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.wait('@dateUpdate')
//           cy.wait(5000)
//         })
//         it('should update the parent date', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(0)
//             .should('contain.text', '1 ')
//         })
//       })
//     })
//     describe('when moving would cause an invalid linked task start date', () => {
//       before(() => {
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(3)
//           .click({ timeout: 10000 })
//         cy.get('button').contains(new RegExp('^12$')).click()
//         cy.wait(1000)
//       })
//       it('should display a modal', () => {
//         cy.get('[data-test=task-update-chip]').should('have.length', 2)
//       })
//       describe('clicking confirm on the modal', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.wait('@dateUpdate')
//           cy.wait(1000)
//         })
//         it('should update the sibling date', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(2)
//             .should('contain.text', '11 ')
//           cy.get('[data-test=task-cell-date-picker-end]')
//             .eq(4)
//             .should('contain.text', '16 ')
//         })
//       })
//     })
//     describe('when moving would cause an invalid linked task end date', () => {
//       before(() => {
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('[data-test=task-cell-date-picker-end]').eq(3).click() //was 4
//         cy.get('button').contains(new RegExp('^18$')).click()
//         cy.wait(1000)
//       })
//       it('should display a modal', () => {
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//       })
//       describe('clicking confirm on the modal', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.wait(1000)
//         })
//         it('should update the start date', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(5)
//             .should('contain.text', '4 ')
//         })
//       })
//     })
//     describe('when changing the status of a task', () => {
//       describe('when marking it as done', () => {
//         before(() => {
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=options-dropdown]', { timeout: 10000 })
//             .eq(0)
//             .click()
//           cy.get('[data-test=status-selection-item-dot]', { timeout: 10000 })
//             .eq(1)
//             .click()
//           cy.wait('@dateUpdate')
//           cy.wait(2000)
//           cy.get('[data-test=options-dropdown]', { timeout: 10000 })
//             .eq(3)
//             .click({ timeout: 10000 })
//           cy.get('[data-test=status-selection-item-dot]').eq(2).click()
//           cy.get('.reactour__close').click()
//           cy.wait(5000)
//           cy.get('[data-test=status-filter-selected-text]', {
//             timeout: 10000,
//           }).click()
//           cy.get('[data-test=done-checkbox]').click()
//           cy.get('[data-test=status-filter-selected-text]').click({
//             force: true,
//           })
//           cy.wait(2000)
//         })
//         it('should unlink the task', () => {
//           cy.get('[data-test=task-cell-test]', { timeout: 10000 })
//             .eq(1)
//             .find('[data-test=dates-linked-icon]')
//             .should('not.exist')
//         })
//       })
//       describe('when marking a done task as not-started', () => {
//         before(() => {
//           cy.get('body').click({ force: true })
//           cy.get('[data-test=options-dropdown]').eq(1).click()
//           cy.get('[data-test=status-selection-item-dot]')
//             .eq(1)
//             .click({ force: true })
//         })
//         it('should offer to link the task', () => {
//           cy.get('[data-test=dialog-header-title-text]', {
//             timeout: 10000,
//           }).should('exist')
//           cy.get('[data-test=dialog-header-title-text]').should(
//             'have.text',
//             'Add to sibling date link'
//           )
//         })
//         describe('when confirming the linking', () => {
//           before(() => {
//             cy.backendRoute(
//               '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//             ).as('dateUpdate')
//             cy.get('[data-test=action-dialog-button]').click()
//             cy.wait('@dateUpdate')
//             cy.wait(2000)
//           })
//           it('should link the task', () => {
//             cy.get('[data-test=task-cell-test]')
//               .eq(3)
//               .find('[data-test=dates-linked-icon]')
//               .should('exist')
//           })
//         })
//         // describe('when cancelling the linking', () => {
//         //   before(() => {
//         //     cy.get('[data-test=options-dropdown]').eq(1).click()
//         //     cy.get('[data-test=status-selection-item-dot]').eq(2).click()
//         //     cy.wait(2000)
//         //     cy.get('[data-test=options-dropdown]', { timeout: 10000 })
//         //       .eq(2)
//         //       .click()
//         //     cy.get('[data-test=status-selection-item-dot]').eq(1).click()
//         //     cy.get('[data-test=cancel-dialog-button]', {
//         //       timeout: 10000,
//         //     }).click({ force: true })
//         //   })
//         //   it('should not link the task', () => {
//         //     cy.get('[data-test=task-cell-test]', { timeout: 10000 })
//         //       .eq(1)
//         //       .find('[data-test=dates-linked-icon]')
//         //       .should('not.exist')
//         //   })
//         // })
//       })

//       describe('when updating linked level a siblings start date', () => {
//         before(() => {
//           cy.login(user.username)
//           appPage.visitTaskMap(4)
//           cy.backendRoute(
//             '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//           ).as('dateUpdate')
//           cy.get('[data-test=options-dropdown]').eq(1).click()
//           cy.get('[data-test=menu-text-link]').click()
//           cy.get('[data-test=link-button-false]').eq(0).click()
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.wait('@dateUpdate')
//           cy.wait(1000)
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(0)
//             .click({ timeout: 10000 })
//           cy.wait(1000)
//           cy.get('button').contains(new RegExp('^2$')).click()
//           cy.wait(5000)
//           cy.get('[data-test=action-dialog-button]').click()
//           cy.wait('@dateUpdate')
//           cy.wait(5000)
//         })
//         it('should not update unlinked sibling dates', () => {
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(0)
//             .should('contain.text', '2 Feb 2000')
//           cy.get('[data-test=task-cell-date-picker-start]')
//             .eq(1)
//             .should('contain.text', '2 Feb 2000')
//           cy.get('[data-test=task-cell-date-picker-start]', { timeout: 10000 })
//             .eq(4)
//             .should('contain.text', '1 Feb 2000')
//         })
//       })
//     })
//     describe('when updating linked level a siblings end date', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskMap(4)
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(0)
//           .click({ timeout: 10000 })
//         cy.get('button').contains(new RegExp('^3$')).click()
//         cy.wait('@dateUpdate')
//         cy.wait(5000)
//         cy.get('[data-test=action-dialog-button]').click()
//         // cy.wait('@dateUpdate')

//         cy.wait(5000)
//       })
//       it('should not update unlinked sibling dates', () => {
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(0)
//           .should('contain.text', '3 Feb 2000')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(1)
//           .should('contain.text', '3 Feb 2000')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(4)
//           .should('contain.text', '2 Feb 2000')
//       })
//     })
//     describe('when updating linked siblings start date', () => {
//       before(() => {
//         cy.backendRoute(
//           '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//         ).as('dateUpdate')
//         // cy.get('[data-test=options-dropdown]').eq(3).click()
//         // cy.get('[data-test=menu-text-link]').click()
//         // // cy.get('[data-test=link-button-false]').eq(0).click() // link all tasks
//         // cy.get('[data-test=edit-all-links-button]').click()
//         // cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(1000)
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(1)
//           .click({ timeout: 10000 })
//         cy.get('button').contains(new RegExp('^3$')).click()
//         cy.wait('@dateUpdate')
//         cy.wait(5000)
//       })
//       it('should not update unlinked sibling dates', () => {
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(1)
//           .should('contain.text', '3 Feb 2000')
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(2)
//           .should('contain.text', '3 Feb 2000')
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(3)
//           .should('contain.text', '2 Feb 2000')
//       })
//     })
//   })
//   describe('when updating linked siblings end date', () => {
//     before(() => {
//       cy.backendRoute(
//         '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
//       ).as('dateUpdate')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(3)
//         .click({ timeout: 10000 })
//       cy.get('button').contains(new RegExp('^4$')).click()
//       cy.wait(1000)

//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait('@dateUpdate')
//       cy.wait(3000) // Detached from DOM issue.
//     })
//     it('should not update unlinked sibling dates', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(1)
//         .should('contain.text', '3 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(2)
//         .should('contain.text', '3 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(3)
//         .should('contain.text', '4 Feb 2000')
//     })
//   })
// })
