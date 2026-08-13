// import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
// import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
// import {
//     generateFixture,
//     getWrapper
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'

// describe('task_psd_parent_consistency.cy', () => {
//   let user, appPage, fixture

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'TaskStatusSortingTest',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: get3LevelATasksWithSubsData(),
//         },
//       }
//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('When updating PSD of a task', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskByName('task2')
//       selectDate('[data-test="planned-start-date"]', 2015, 6, 15)
//       cy.wait(5000)
//     })

//     // it('should display the updated dates', () => {
//     //   cy.get('[data-test="planned-start-date"]')
//     //     .find('input')
//     //     .should('have.value', 'Mon 15 Jun 2015')
//     // })

//     describe('and updating a child tasks PSD earlier than its parent', () => {
//       before(() => {
//         cy.login(user.username)
//         appPage.visitTaskByName('subtask5')
//         selectDate('[data-test="planned-start-date"]', 2015, 6, 13)
//       })

//       describe('a dialog should be displayed', () => {
//         it('should have the correct title', () => {
//           cy.get('[data-test=dialog-header-title-text]').should(
//             'contain.text',
//             'Change dates: subtask5'
//           )
//         })

//         it('should display the confirmation dialog', () => {
//           cy.get('[data-test=task-update-chip]').should('have.length', 1)
//         })

//         describe('Clicking the Cancel button ', () => {
//           before(() => {
//             cy.get('[data-test=cancel-dialog-button]').click()
//           })

//           it('should no longer display the dialog', () => {
//             cy.get('[data-test=dialog-prompt-text]').should('not.exist')
//           })

//           it('The PSD should NOT persist the earlier date', () => {
//             cy.get('[data-test="planned-start-date"]')
//               .should('not.contain.text', 'Sat 13 Jun 2015')
//           })
//         })

//         describe('Clicking the continue button', () => {
//           before(() => {
//             cy.login(user.username)
//             selectDate('[data-test="planned-start-date"]', 2015, 6, 13)
//             cy.get('[data-test=action-dialog-button]').click()
//           })

//           it('should no longer display the dialog', () => {
//             cy.get('[data-test=dialog-prompt-text]').should('not.exist')
//           })

//           it('should update the PSD', () => {
//             cy.get('[data-test="planned-start-date"]')
//               .should('contain.text', 'Sat 13 Jun 2015')
//           })

//           describe('and its parent', () => {
//             before(() => {
//               cy.login(user.username)
//               appPage.visitTaskByName('task2')
//             })

//             it('should have PSD updated', () => {
//               cy.get('[data-test="planned-start-date"]')
//                 .should('contain.text', 'Sat 13 Jun 2015')
//             })
//           })
//         })
//       })
//     })
//   })
// })
