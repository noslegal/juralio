// import {
//   getProjectAtoCLevelData,
//   getProjectWith8LevelATasks,
// } from '../../../../../../helpers/data/task_operations_test_project_data'
// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../helpers/matterprojects/fixture_helper'
// import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
// import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
// import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
// import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

// describe('template_task_move_another_project_level_a_validation.cy', () => {
//   let user, appPage, fixture
//   const { moveDialog } = taskDetailPage

//   before(() => {
//     createKnowledgeManagerUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'TemplateTaskMoveLevelAValidation',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             getProjectWith8LevelATasks('Parrot')[0],
//             getProjectAtoCLevelData(),
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })
//   describe('When the template task details are loaded', () => {
//     let templateId, templateId2

//     before(() => {
//       cy.login(user.username)
//       createTemplate('New Template2', fixture.projects[1].id).then(template => {
//         templateId2 = template.id
//       })
//       createTemplate('checkValidation', fixture.projects[0].id).then(
//         template => {
//           templateId = template.id
//           appPage.visitTemplateTaskMap(templateId)
//           cy.get('[data-test=task-cell-test]').eq(9).click({ force: true })
//         }
//       )
//     })
//     describe('When the Move dialog is opened and level A selected', () => {
//       before(() => {
//         openTemplateTaskMove()
//         moveDialog.get.destinationSelectionDropdown().click()
//         moveDialog.get.destinationOption.newProject().click()
//         cy.wait(5000)
//         cy.get('[data-test=auto-complete-search-term]')
//           .eq(1)
//           .click()
//           .find('input')
//           .type('checkValidation')
//         cy.wait(5000)
//         cy.get('[data-test=search-result-list-item]', { timeout: 30000 })
//           .eq(0)
//           .click()
//         moveDialog.get.destinationSelectionDropdown().eq(1).click()
//         cy.wait(5000)
//         moveDialog.get.destinationOption.levelA().click()
//       })

//       it('the level A subtask limit validation message should be shown.', () => {
//         moveDialog.get.validationMessage().should('be.visible')
//         moveDialog.get
//           .validationMessage()
//           .should(
//             'have.text',
//             'A template cannot have more than 8 level A tasks.'
//           )
//       })

//       describe('When the destination type is changed', () => {
//         before(() => {
//           moveDialog.get.destinationSelectionDropdown().eq(1).click()
//           moveDialog.get.destinationOption.newTask().click()
//         })

//         it('the validation message should be cleared.', () => {
//           moveDialog.get.validationMessage().should('not.exist')
//         })
//       })
//     })
//   })
// })
