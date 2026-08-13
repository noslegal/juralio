// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../helpers/users/user_api_helper'

// describe('task_card_date_linking.cy', () => {
//   const getDialogTitle = () => cy.get('[data-test=dialog-header-title-text]')
//   const cancelDialog = () => cy.get('[data-test=cancel-dialog-button]').click()

//   let user, fixture, appPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'taskDetailsLinking',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [{ name: 'Atlas' }, { name: 'Beta' }, { name: 'Charlie' }],
//             },
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('when navigating to the task details', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//       cy.get('[data-test=task-cell-test]')
//         .eq(1)
//         .find('[data-test=name]')
//         .click()
//     })

//     it('should show the no linked siblings button', () => {
//       cy.get('[data-test=add-links-button]').should('exist')
//     })

//     describe('and clicking the link date operation', () => {
//       before(() => {
//         cy.get('[data-test=add-links-button]').click()
//         cy.get('[data-test=link-task-as-sibling]').eq(0).click()
//         cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
//           'projectFetch'
//         )
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait('@projectFetch')
//       })

//       it('should should show a label displaying how many siblings are linked (singular)', () => {
//         cy.wait(3000)
//         cy.get('[data-test=add-links-button]', { timeout: 10000 })
//           .invoke('text')
//           .then(text => {
//             expect(text.replace(/\u00a0/g, ' ')).equal(
//               'These dates are linked to 1 sibling task'
//             )
//           })
//       })
//     })

//     describe('Display the edit dialog ', () => {
//       before(() => {
//         cy.get('[data-test=add-links-button]').click()
//       })
//       it('should have the dialog header', () => {
//         getDialogTitle().contains('Linked sibling task dates')
//       })

//       it('should have the unlink tasks button', () => {
//         cy.get('[data-test=edit-all-links-button]').should(
//           'contain.text',
//           'Link All'
//         )
//       })
//       it('link buttons should be done colour as tasks are linked', () => {
//         cy.get('[data-test=link-button-true]')
//           .eq(0)
//           .should('have.css', 'background-color')
//           .and('eq', 'rgb(99, 166, 169)')
//       })
//     })

//     describe('when linking all the siblings', () => {
//       before(() => {
//         cy.get('[data-test=edit-all-links-button]').click()
//         cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
//           'projectFetch'
//         )
//         cy.get('[data-test=action-dialog-button]').click()
//         cy.wait('@projectFetch')
//         cy.wait(1000)
//         cy.get('[data-test=add-links-button]')
//       })

//       it('should should show a label displaying how many siblings are linked (plural)', () => {
//         cy.get('[data-test=add-links-button]')
//           .invoke('text')
//           .then(text => {
//             expect(text.replace(/\u00a0/g, ' ')).equal(
//               'These dates are linked to 2 sibling tasks'
//             )
//           })
//       })
//     })

//     describe('Changing the information then canceling should not have an impact ', () => {
//       before(() => {
//         cy.get('[data-test=add-links-button]').click()
//         cy.get('[data-test=edit-all-links-button]').click()
//         cancelDialog()
//       })

//       it('should still have siblings linked on task card', () => {
//         cy.get('[data-test=add-links-button]').should('exist')
//         cy.get('[data-test=add-links-button]').should('contain', 2)
//       })

//       describe('Removing links from sibling tasks', () => {
//         before(() => {
//           cy.get('[data-test=add-links-button]').click()
//           cy.get('[data-test=edit-all-links-button]').click()

//           cy.get('[data-test=action-dialog-button]').click()
//         })

//         it('should no longer have linked tasks', () => {
//           cy.get('[data-test=add-links-button]').should('exist')
//         })
//       })
//     })

//     describe(
//       'Dialog should not allow user to confirm bad state',
//       { retries: { runMode: 3, openMode: 1 } },
//       () => {
//         before(() => {
//           cy.login(user.username)
//           cy.reload()
//           cy.get('[data-test=add-links-button]').click()
//         })

//         it('should not let user confirm if nothing has changed', () => {
//           cy.get('[data-test=action-dialog-button]').should('be.disabled')
//           cy.get('[data-test=cancel-dialog-button]').click()
//           cy.get('[data-test=add-links-button]').click()
//         })

//         describe('Button should be active when user has made changes', () => {
//           before(() => {
//             cy.get('[data-test=edit-all-links-button]').click()
//             cy.get('[data-test=edit-all-links-button]').click()
//             cy.get('[data-test=link-button-false]').eq(0).click({ force: true })
//           })

//           it('should let user confirm if one task is linked', () => {
//             cy.get('[data-test=action-dialog-button]').should('be.enabled')
//           })

//           describe('Button should be active when user has made changes', () => {
//             before(() => {
//               cy.get('[data-test=link-button-false]')
//                 .eq(0)
//                 .click({ force: true })
//             })
//             it('should let user confirm if two tasks are linked', () => {
//               cy.get('[data-test=action-dialog-button]').should('be.enabled')
//             })
//           })
//         })
//       }
//     )
//   })
// })
