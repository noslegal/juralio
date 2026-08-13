// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import taskmapPage from '../../../../../page/taskmap/taskmap_page'

// describe('task_map_date_link.cy', () => {
//   const getDialogTitle = () => cy.get('[data-test=dialog-header-title-text]')
//   const cancelDialog = () => cy.get('[data-test=cancel-dialog-button]').click()
//   const taskCellMenu = taskmapPage.operationMenu

//   let user, fixture

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'taskMapTest',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             { tasks: [{ name: 'Atlas' }, { name: 'Beta' }, { name: 'Theta' }] },
//             {
//               tasks: [
//                 {
//                   name: 'parent1',
//                   properties: {
//                     datesLinkedToSiblings: true,
//                     plannedStartDate: new Date(2000, 5, 5),
//                   },
//                   tasks: [
//                     {
//                       name: 'child1',
//                       properties: {
//                         datesLinkedToSiblings: true,
//                         plannedStartDate: new Date(2000, 5, 7),
//                       },
//                     },
//                     {
//                       name: 'child2',
//                       properties: {
//                         datesLinkedToSiblings: true,
//                         plannedStartDate: new Date(2000, 5, 7),
//                       },
//                     },
//                   ],
//                 },
//                 {
//                   name: 'parent2',
//                   properties: {
//                     datesLinkedToSiblings: true,
//                     plannedStartDate: new Date(2000, 5, 4),
//                   },
//                 },
//               ],
//             },
//             {
//               name: 'project 3',
//               tasks: [
//                 {
//                   name: 'A',
//                   properties: {
//                     plannedStartDate: new Date(2000, 5, 1),
//                     plannedEndDate: new Date(2000, 5, 20),
//                   },
//                   tasks: [
//                     {
//                       name: 'b',
//                       properties: {
//                         datesLinkedToSiblings: true,
//                         plannedStartDate: new Date(2000, 5, 5),
//                         plannedEndDate: new Date(2000, 5, 8),
//                       },
//                     },
//                     {
//                       name: 'c',
//                       properties: {
//                         datesLinkedToSiblings: true,
//                         plannedStartDate: new Date(2000, 5, 5),
//                         plannedEndDate: new Date(2000, 5, 8),
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

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//       cy.wait('@projectFetch')
//       cy.wait(2000) // DOM Detached issue
//       taskCellMenu.taskCellDropDownArrow().eq(0).click()
//     })

//     it('should show the link dates options', () => {
//       taskCellMenu.linkMenuText().contains('Add task link')
//     })

//     describe('and clicking the link date operation', () => {
//       before(() => {
//         cy.get('body').click()
//         taskCellMenu.taskCellDropDownArrow().eq(0).click()
//         taskCellMenu.linkMenuText().click()
//       })

//       it('should pop up with the link siblings dialog', () => {
//         getDialogTitle().contains('Linked sibling task dates')
//       })

//       it('should have link all button', () => {
//         cy.get('[data-test=edit-all-links-button]').should(
//           'contain.text',
//           'Link All'
//         )
//       })

//       it('link buttons should be grey as no link exists', () => {
//         cy.get('[data-test=link-button-false]')
//           .eq(0)
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(255, 255, 255)')
//       })
//     })

//     describe('and clicking the link all button', () => {
//       before(() => {
//         cy.get('[data-test=edit-all-links-button]').click()
//       })

//       it('should change the text in the button', () => {
//         cy.get('[data-test=edit-all-links-button]').should(
//           'contain.text',
//           'Unlink All'
//         )
//       })
//       it('link buttons should be done colour as link now exists', () => {
//         cy.get('[data-test=link-button-true]')
//           .eq(0)
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(99, 166, 169)')
//       })
//     })

//     describe('closing and reopening the dialog should not save your changes', () => {
//       before(() => {
//         cancelDialog()
//         cy.get('body').click()
//         taskCellMenu.taskCellDropDownArrow().eq(0).click()
//         cy.wait(2000)
//         taskCellMenu.linkMenuText().click({ timeout: 10000 })
//       })

//       it('should change the text in the button', () => {
//         cy.get('[data-test=edit-all-links-button]').should(
//           'contain.text',
//           'Link All'
//         )
//       })
//       it('link buttons should be grey colour as no link exists', () => {
//         cy.get('[data-test=link-button-false]')
//           .eq(0)
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(255, 255, 255)')
//       })
//     })

//     describe('selecting two tasks to become linked ', () => {
//       before(() => {
//         cy.get('[data-test=link-button-false]').click({
//           multiple: true,
//           force: true,
//         })
//         cy.get('[data-test=action-dialog-button]').click()
//       })

//       it('should close the dialog', () => {
//         getDialogTitle().should('not.exist')
//       })
//       it('should show link icon on both tasks', () => {
//         cy.get('[data-test=dates-linked-icon]', { timeout: 10000 }).should(
//           'have.length',
//           3
//         ) // 3 including the task from which the dialog was opened
//       })
//     })
//     describe('updating a linked parent', () => {
//       before(() => {
//         cy.login(user.username)
//         cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
//         cy.visit(
//           `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[1].id}/taskmap`
//         )
//         cy.wait('@projectFetch')
//         cy.wait(2000) // DOM Detached issue
//         cy.get('[data-test=task-cell-date-picker-start]').eq(2).click()
//         cy.get('button').contains(new RegExp('^6$')).click()
//         cy.wait(1000)
//       })
//       it('should not update the linked parent', () => {
//         cy.get('[data-test=task-cell-date-picker-start]')
//           .eq(3)
//           .should('contain.text', '4 Jun 2000')
//       })
//     })
//     describe('when updating a linked task inside tha parents dates range', () => {
//       before(() => {
//         cy.login(user.username)
//         cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
//         cy.visit(
//           `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[2].id}/taskmap`
//         )
//         cy.wait('@projectFetch')
//         cy.wait(2000)
//         cy.get('[data-test=task-cell-date-picker-end]').eq(2).click()
//         cy.wait(2000)
//         cy.get('button').contains(new RegExp('^7$')).click()
//         cy.wait(2000)
//       })
//       it('should not throw up a dialog', () => {
//         cy.get('[data-test=action-dialog-button]').should('not.exist')
//       })
//       it('should allow the changes automatically', () => {
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(0)
//           .should('contain.text', '20 Jun 2000')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(1)
//           .should('contain.text', '7 Jun 2000')
//         cy.get('[data-test=task-cell-date-picker-end]')
//           .eq(2)
//           .should('contain.text', '7 Jun 2000')
//       })
//     })
//   })
// })
