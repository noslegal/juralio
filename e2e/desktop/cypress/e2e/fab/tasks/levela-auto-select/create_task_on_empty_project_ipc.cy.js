// import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../helpers/users/user_api_helper'
// import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

// describe('create_task_on_empty_project_ipc.cy', () => {
//   let user, fixture, appPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser

//       const seed = {
//         matter: {
//           prefix: 'testmtaskcreatelaasipc',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'Task Create Auto LevelA Select',
//               tasks: [],
//             },
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('when at home screen and Create Task FAB button is clicked', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap(0)
//       destinationHelper.openTaskCreateFlowFromFab()
//     })

//     describe('When a name is entered and Next pressed', () => {
//       before(() => {
//         cy.get('[data-test=text-prompt-text-field]')
//           .find('input')
//           .type('This is a new Task')
//         cy.get('[data-test=action-dialog-button]').click()
//       })

//       it('should have the Matter selected in the dialog', () => {
//         cy.wait(3000)
//         cy.get('[data-test=matter-select-container] input').should(
//           'have.attr',
//           'value',
//           fixture.matter.name + ' - ' + fixture.matter.matterId
//         )
//       })

//       it('Has the level A option selected', () => {
//         destinationPage.get.parentTypeSelector().click()
//         cy.get('[data-test="destination-level-a"]').click()
//         destinationPage.get
//           .parentTypeSelector()
//           .should('contain.text', 'Level A')
//       })

//       describe('when click create button', () => {
//         before(() => {
//           cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
//             'postNewTask'
//           )
//           cy.backendRoute('/matter/*/workstreams/**').as('projectFetch')
//           destinationPage.get.createButton().click()
//           cy.wait(['@postNewTask', '@projectFetch'])
//         })

//         it('should display the new created task', () => {
//           cy.get('[data-test=structureItem]')
//             // .find('[depth=1]')
//             .should('have.length', 1)
//         })
//       })
//     })
//   })
// })
