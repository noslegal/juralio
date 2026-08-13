// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import pushDateButton from '../../../../../../../helpers/tasks/task_date_picker_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'

// describe('task_dates_change_confirmation_dialog_display.cy', () => {
//   let user, appPage, fixture
//   before(() => {
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
//                 {
//                   name: 'a',
//                   properties: {
//                     plannedStartDate: new Date(2000, 1, 5),
//                     plannedEndDate: new Date(2000, 1, 10),
//                   },
//                   tasks: [
//                     {
//                       name: 'b',
//                       properties: {
//                         plannedStartDate: new Date(2000, 1, 7),
//                         plannedEndDate: new Date(2000, 1, 10),
//                         datesLinkedToSiblings: true,
//                       },
//                       tasks: [
//                         {
//                           name: 'c',
//                           properties: {
//                             plannedStartDate: new Date(2000, 1, 7),
//                             plannedEndDate: new Date(2000, 1, 10),
//                           },
//                         },
//                       ],
//                     },
//                     {
//                       name: 'd',
//                       properties: {
//                         plannedStartDate: new Date(2000, 1, 5),
//                         plannedEndDate: new Date(2000, 1, 10),
//                         datesLinkedToSiblings: true,
//                       },
//                       tasks: [
//                         {
//                           name: 'e',
//                           properties: {
//                             plannedStartDate: new Date(2000, 1, 5),
//                             plannedEndDate: new Date(2000, 1, 10),
//                           },
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
//       appPage = getWrapper(fixture)
//     })
//   })
//   describe('when changing not-started dates', () => {
//     before(() => {
//       cy.login(user)
//       appPage.visitTaskMap()
//     })
//     describe('when moving a subtask start date forward', () => {
//       before(() => {
//         cy.get('[data-test=task-cell-date-picker-start]').eq(1).click()
//         pushDateButton('6')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 2)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Fri 4 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Fri 4 Feb 2000')
//       })
//     })
//     describe('when moving a subtask end date backwards', () => {
//       before(() => {
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(1)
//           .click({ force: true })
//         pushDateButton('9')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Thu 10 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Thu 10 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Thu 10 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Wed 9 Feb 2000')
//       })
//     })
//     describe('when moving a subsubtask start date forward', () => {
//       before(() => {
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-start]').eq(2).click()
//         pushDateButton('5')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Fri 4 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Thu 3 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Sun 6 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Fri 4 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Thu 3 Feb 2000')
//       })
//     })
//     describe('when moving a subsubtask end date forwards', () => {
//       before(() => {
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(4)
//           .click({ timeout: 30000 })
//         pushDateButton('11')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Thu 10 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Fri 11 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Fri 11 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Fri 11 Feb 2000')
//       })
//     })
//     describe('when moving a parent start date forward', () => {
//       before(() => {
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-start]').eq(0).click()
//         pushDateButton('6')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 4)
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Thu 3 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Sun 6 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Sun 6 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Sun 6 Feb 2000')

//         cy.get('[data-test=date-before]')
//           .eq(3)
//           .should('contain.text', 'Sat 5 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(3)
//           .should('contain.text', 'Sun 6 Feb 2000')
//       })
//     })
//     describe('when moving a parent end date backwards', () => {
//       before(() => {
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-end]').eq(0).click()
//         pushDateButton('9')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Fri 11 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Fri 11 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Fri 11 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Wed 9 Feb 2000')
//       })
//     })
//   })

//   describe('when changing in-progress dates', () => {
//     before(() => {
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait(2000)
//       cy.login(user)
//       appPage.visitTaskMap()
//       cy.get('[data-test=options-dropdown]').eq(3).click()
//       cy.get('[data-test=status-selection-item-dot]').eq(1).click()
//       cy.wait(3000)
//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait(3000)
//       cy.get('[data-test=options-dropdown]').eq(2).click()
//       cy.get('[data-test=status-selection-item-dot]').eq(1).click()
//       cy.wait(3000)

//       cy.get('[data-test=action-dialog-button]').click()
//       cy.wait(3000)
//     })

//     describe('when moving a subtask end date backwards', () => {
//       before(() => {
//         cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//           .eq(1)
//           .click()
//         pushDateButton('8')
//       })
//       it('should update linked task and parent', () => {
//         cy.get('[data-test=dialog-prompt-text]').should('exist')
//         cy.get('[data-test=task-update-chip]').should('have.length', 3)
//         cy.get('[data-test=date-before]')
//           .eq(0)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(0)
//           .should('contain.text', 'Tue 8 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(1)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(1)
//           .should('contain.text', 'Tue 8 Feb 2000')
//         cy.get('[data-test=date-before]')
//           .eq(2)
//           .should('contain.text', 'Wed 9 Feb 2000')
//         cy.get('[data-test=date-after]')
//           .eq(2)
//           .should('contain.text', 'Tue 8 Feb 2000')
//       })
//     })
//     // describe('when moving a subsubtask end date forwards', () => {
//     //   before(() => {
//     //     cy.get('[data-test=action-dialog-button]').click()
//     //     cy.wait(2000)
//     //     cy.get('[data-test=task-cell-date-picker-end]', { timeout: 10000 })
//     //       .eq(1)
//     //       .click({ force: true })
//     //     pushDateButton('11')
//     //   })
//     //   it('should update linked task and parent', () => {
//     //     cy.get('[data-test=dialog-prompt-text]').should('exist')
//     //     cy.get('[data-test=task-update-chip]').should('have.length', 3)
//     //     cy.get('[data-test=date-before]')
//     //       .eq(0)
//     //       .should('contain.text', 'Wed 9 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(0)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //     cy.get('[data-test=date-before]')
//     //       .eq(2)
//     //       .should('contain.text', 'Tue 8 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(2)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //     cy.get('[data-test=date-before]')
//     //       .eq(1)
//     //       .should('contain.text', 'Tue 8 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(1)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //   })
//     // })
//     // describe('when moving a parent end date backwards', () => {
//     //   before(() => {
//     //     cy.get('[data-test=action-dialog-button]').click()
//     //     cy.wait(2000)
//     //     cy.get('[data-test=task-cell-date-picker-end]').eq(0).click()
//     //     pushDateButton('9')
//     //   })
//     //   it('should update linked task and parent', () => {
//     //     cy.get('[data-test=dialog-prompt-text]').should('exist')
//     //     cy.get('[data-test=task-update-chip]').should('have.length', 3)
//     //     cy.get('[data-test=date-before]')
//     //       .eq(0)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(0)
//     //       .should('contain.text', 'Wed 9 Feb 2000')
//     //     cy.get('[data-test=date-before]')
//     //       .eq(1)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(1)
//     //       .should('contain.text', 'Wed 9 Feb 2000')
//     //     cy.get('[data-test=date-before]')
//     //       .eq(2)
//     //       .should('contain.text', 'Fri 11 Feb 2000')
//     //     cy.get('[data-test=date-after]')
//     //       .eq(2)
//     //       .should('contain.text', 'Wed 9 Feb 2000')
//     //   })
//     //   after(() => {
//     //     cy.get('[data-test=action-dialog-button]').click()
//     //     cy.wait(2000)
//     //   })
//     // })
//   })
// })
