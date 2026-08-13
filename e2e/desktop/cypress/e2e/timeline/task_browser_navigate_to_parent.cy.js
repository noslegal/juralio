// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../helpers/users/user_api_helper'

// describe('task_browser_navigate_to_parent.cy', () => {
//   let fixture, user

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'A1',
//                   tasks: [
//                     { name: 'B1', tasks: [{ name: 'C1' }, { name: 'C2' }] },
//                     { name: 'B2' },
//                     { name: 'B3' },
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

//   describe('when viewing the timeline for a specific task the task browser', () => {
//     const getBar = () => cy.get('[data-test=task-browser-bar]')
//     const getBarByIndex = index => getBar().eq(index)

//     before(() => {
//       cy.login(user.username)
//       cy.backendRoute('/inboxnotifications/*').as('inboxNotifications')
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasksMappedByName['B1'].id}/timeline`
//       )
//       cy.wait('@inboxNotifications')
//     })

//     it('should display a button for navigating to the parent task', () => {
//       cy.get('[data-test=navigate-to-parent]').should('be.visible')
//     })

//     it('should display a total of 3 tasks', () => {
//       cy.get('[data-test=task-browser-bar]').should('have.length', 3)
//     })

//     describe('before clicking the navigate to parent button', () => {
//       it('should display correct label text for task as the selected (root) task', () => {
//         getBarByIndex(0).should('have.text', 'B . B1  #2')
//       })

//       it('should display the label text "C . C1  #3" for subtask as the first subtask', () => {
//         getBarByIndex(1).should('have.text', 'C . C1  #3')
//       })

//       it('should display the label text "C . C2  #4"  for subtask as the second subtask', () => {
//         getBarByIndex(2).should('have.text', 'C . C2  #4')
//       })
//     })

//     describe('when the navigate to parent button is clicked', () => {
//       before(() => {
//         cy.get('[data-test=navigate-to-parent]').click({ force: true })
//       })

//       it('should display a total of 4 tasks', () => {
//         cy.get('[data-test=task-browser-bar]').should('have.length', 4)
//       })

//       it('should display A1 task as the selected (root) task', () => {
//         getBarByIndex(0).should('have.text', 'A . A1  #1')
//       })

//       it('should display the correct label for subtask as the first subtask', () => {
//         getBarByIndex(1).should('have.text', 'B . B1  #2')
//       })

//       it('should display the correct label for subtask as the second subtask', () => {
//         getBarByIndex(2).should('have.text', 'B . B2  #5')
//       })

//       it('should display the correct label for subtask as the third subtask', () => {
//         getBarByIndex(3).should('have.text', 'B . B3  #6')
//       })
//     })
//   })
// })
