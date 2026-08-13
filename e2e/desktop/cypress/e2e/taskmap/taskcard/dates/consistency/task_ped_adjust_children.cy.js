// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'

// describe('task_ped_adjust_children.cy', () => {
//   let user, appPage, fixture

//   before(() => {
//     cy.window().then(win => {
//       win.sessionStorage.clear()
//     })
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'subtask_dates',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'task1',
//                   properties: {
//                     plannedEndDate: new Date(2000, 1, 3),
//                   },
//                   tasks: [
//                     {
//                       name: 'task 1 level 1',
//                       properties: {
//                         plannedEndDate: new Date(2000, 1, 2),
//                       },
//                       tasks: [
//                         {
//                           name: 'task 1 level 2',
//                           properties: {
//                             plannedEndDate: new Date(2000, 1, 1),
//                           },
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 {
//                   name: 'task2',
//                   properties: {
//                     plannedEndDate: new Date(2000, 1, 1),
//                     status: 'in-progress',
//                   },
//                   tasks: [
//                     {
//                       name: 'task 2 level 1',
//                       properties: {
//                         status: 'in-progress',
//                         plannedEndDate: new Date(2000, 1, 3),
//                       },

//                       tasks: [
//                         {
//                           name: 'task 2 level 2',
//                           properties: {
//                             plannedEndDate: new Date(2000, 1, 3),
//                             status: 'in-progress',
//                           },
//                         },

//                         {
//                           name: 'task 2 level 2 b',
//                           properties: {
//                             plannedEndDate: new Date(2000, 1, 2),
//                             status: 'done',
//                           },
//                         },
//                         {
//                           name: 'task 2 level 2 c',
//                           properties: {
//                             plannedEndDate: new Date(2000, 1, 3),
//                             status: 'not-started',
//                           },
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 {
//                   name: 'task3',
//                   properties: {
//                     plannedEndDate: new Date(2000, 1, 1),
//                   },
//                   tasks: [{ name: 'task3 level 1' }],
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

//   describe('increasing the PSD of a not started task', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('.reactour__close').click()

//       cy.get('[data-test=task-cell-date-picker-end]').eq(1).click()
//       cy.get('button').contains(new RegExp('^4$')).click()
//       cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
//       cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
//         'projectFetch'
//       )
//       cy.wait('@projectFetch')
//       cy.wait(1000) //figure out how to get rid of this wait
//     })
//     it('should update itself, its children and grandchildren', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(1)
//         .should('have.text', '4 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(4)
//         .should('have.text', '3 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(8)
//         .should('have.text', '2 Feb 2000')
//     })
//   })
//   describe('decreasing the PSD of a not started task', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-date-picker-end]').eq(1).click()
//       cy.get('button').contains(new RegExp('^3$')).click()
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
//         'projectFetch'
//       )
//       cy.wait('@projectFetch')
//       cy.wait(1000) //figure out how to get rid of this wait
//     })
//     it('should update itself, its children and grandchildren', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(1)
//         .should('have.text', '3 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(4)
//         .should('have.text', '2 Feb 2000')
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(8)
//         .should('have.text', '1 Feb 2000')
//     })
//   })
//   describe('increase the PSD of task with indirect dated subtasks', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-test]').eq(1).click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]').click()
//       cy.get('button').contains(new RegExp('^2$')).click()
//       cy.get('[data-test=action-dialog-button]').click()
//       appPage.visitTaskMap()
//     })
//     it('should only update tasks with dates', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(8)
//         .should('have.text', '1 Feb 2000')
//       cy.get('[data-test=task-cell-test]').eq(4).click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]')
//         .find('input')
//         .should('have.value', 'Wed 2 Feb 2000')
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-test]')
//         .eq(7)
//         .find('[data-test=name]')
//         .click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]')
//         .find('input')
//         .should('have.value', 'Wed 2 Feb 2000')
//     })
//   })
//   describe('should not update done task', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('[data-test=status-filter-selected-text]').click()
//       cy.get('[data-test=done-checkbox]').click()
//       // cy.get('body').click()
//       cy.wait(1000)
//       cy.get('[data-test=task-cell-test]').eq(7).click()
//     })
//     it('should not update done tasks', () => {
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]')
//         .find('input')
//         .should('have.value', 'Wed 2 Feb 2000')
//     })

//     after(() => {
//       appPage.visitTaskMap()
//       cy.get('[data-test=status-filter-selected-text]').click()
//       cy.get('[data-test=done-checkbox]').click()
//       // cy.get('body').click()
//     })
//   })
//   describe('decrease the PSD of task with indirect dated subtasks', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-test]').eq(1).click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]').click()
//       cy.get('button').contains(new RegExp('^1$')).click()
//       cy.get('[data-test=action-dialog-button]').click()
//       appPage.visitTaskMap()
//       cy.wait(3000) // Detatched DOM Issue.
//     })
//     it('should only update tasks with dates', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(7)
//         .should('have.text', '1 Feb 2000')
//       cy.get('[data-test=task-cell-test]')
//         .eq(4)
//         .find('[data-test=name]')
//         .click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]')
//         .find('input')
//         .should('have.value', 'Tue 1 Feb 2000')
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-test]')
//         .eq(7)
//         .find('[data-test=name]')
//         .click()
//       cy.get('[data-test=date-expansion-button]', { timeout: 10000 }).should(
//         'be.visible'
//       )
//       cy.get('[data-test=date-expansion-button]').click()
//       cy.get('[data-test=planned-end-date]')
//         .find('input')
//         .should('have.value', 'Tue 1 Feb 2000')
//     })
//   })
//   describe('when there are no valid subtasks', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.wait(3000) // Detatched DOM Issue.
//       cy.get('[data-test=task-cell-date-picker-end]').eq(2).click()
//       cy.get('button').contains(new RegExp('^2$')).click()
//       cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
//         'projectFetch'
//       )
//       cy.wait('@projectFetch')
//       cy.wait(1000)
//     })
//     it('should not bring up the subtask menu', () => {
//       cy.get('[data-test=dialog-header-title-text]').should('not.exist')
//     })
//     it('should update the sleected date', () => {
//       cy.get('[data-test=task-cell-date-picker-end]')
//         .eq(2)
//         .should('have.text', '2 Feb 2000')
//     })
//   })
// })
