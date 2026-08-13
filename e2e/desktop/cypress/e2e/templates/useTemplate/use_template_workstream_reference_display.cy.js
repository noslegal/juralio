// import nameGenerator from 'project-name-generator'
// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { selectTemplateProjectAndConfirm } from '../../../../../helpers/templates/project_from_template_helper'
// import {
//   createTemplate,
//   publishTemplate,
// } from '../../../../../helpers/templates/template_api_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

// describe('use_template_workstream_reference_display.cy', () => {
//   let user, fixture, newTemplate
//   const visitHelpers = new VisitHelpers()
//   const newTemplateName = nameGenerator.generate().spaced

//   before(() => {
//     createUser('TEST', true, true, {
//       roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
//     }).then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'UseTemplate ',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   name: 'MOON - A',
//                   tasks: [],
//                 },
//               ],
//             },
//             {},
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//     })
//   })

//   describe('When trying to use template task as a subtask of - ', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(newTemplateName, fixture.projects[0].id)
//         .then(template => {
//           newTemplate = template
//         })
//         .then(() => {
//           publishTemplate(newTemplate.id)
//           visitHelpers.visitTemplateOverview(newTemplate.id)
//         })

//       it('should have map displayed', () => {
//         cy.get('[data-test=container]').should('have.length', 1)
//       })
//     })

//     describe('a parent which already has 8 subtasks', () => {
//       before(() => {
//         selectTemplateProjectAndConfirm()
//         cy.get('[data-test=existing-project-radio]').click()

//         templateSourceDialogPage.get.matterSelector().click()
//         cy.focused().type('UseTemplate')
//         cy.backendRoute(
//           '/matter/*/workstreams?excludeClosed=true&levelATasksOnly=false'
//         ).as('projectsFetch')
//         templateSourceDialogPage.get.matterSelectorItem().first().click()

//         cy.get('[data-test=destination-select]', { timeout: 30000 }).click()
//       })

//       it(
//         'should display the reference number',
//         { retries: { runMode: 2, openMode: 1 } },
//         () => {
//           cy.get('[data-test=workstream-item-reference-number]').should(
//             'be.visible'
//           )
//           cy.get('[data-test=workstream-item-reference-number]').should(
//             'have.length',
//             2
//           )
//         }
//       )
//     })
//   })
// })
