// import nameGenerator from 'project-name-generator'

// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
// import { createTemplate } from '../../../../../helpers/templates/template_api_helper'

// const newTemplateName = nameGenerator.generate().spaced

// describe('template_subtask_rename.cy', () => {
//   let user, fixture, newTemplate, appPage

//   before(() => {
//     createKnowledgeManagerUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'template_subtask_rename',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'Test Project',
//               tasks: [
//                 {
//                   name: 'Print Documents',
//                   tasks: [{ name: 'Shred' }],
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

//   describe('When opening a task with no subtasks', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
//         newTemplate = template
//         appPage.visitTemplates()

//         cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
//         cy.get(
//           `[data-recordid=${newTemplate.id}] [data-test=template-name]`
//         ).click()
//         cy.get('[data-test=taskmap-navigation]').click()
//         cy.wait('@getTemplateTasks')

//         cy.get('[depth=1]').eq(0).click('center', { force: true })
//       })
//     })

//     it('the subtasks should be displayed', () => {
//       cy.get('[data-test=task-cell-test]').should('have.length', 1)
//     })

//     describe('When clicking on the operations menu', () => {
//       before(() => {
//         cy.get('[data-test=options-dropdown]').eq(0).click()
//       })

//       it('should show the rename option', () => {
//         cy.get('[data-test=menu-text-rename]').should('be.visible')
//       })

//       describe('When clicking on the rename operation and entering a new name', () => {
//         before(() => {
//           cy.get('[data-test=menu-text-rename]').click()

//           cy.backendRoute('PATCH', 'projecttemplates/*/tasks').as(
//             'postRename'
//           )
//           cy.get('[data-test=edit-name-field] input')
//             .clear()
//             .type('Renamed Task{enter}')
//           cy.wait('@postRename')
//         })

//         it('should show the rename option', () => {
//           cy.get('[data-test=task-cell-test]').should(
//             'contain.text',
//             'Renamed Task'
//           )
//         })

//         describe('When the page is reloaded', () => {
//           before(() => {
//             cy.login(user.username)
//             cy.reload()
//           })

//           it('should show the rename option', () => {
//             cy.get('[data-test=task-cell-test]').should(
//               'contain.text',
//               'Renamed Task'
//             )
//           })
//         })
//       })
//     })
//   })
// })
