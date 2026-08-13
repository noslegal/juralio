// import nameGenerator from 'project-name-generator'
// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
// import {
//   showDoneTasks,
//   taskStatusColors,
// } from '../../../../../helpers/taskmap/task-map-helper'
// import { selectTemplateProjectAndConfirm } from '../../../../../helpers/templates/project_from_template_helper'
// import {
//   createTemplate,
//   publishTemplate,
// } from '../../../../../helpers/templates/template_api_helper'
// import { populateTemplateWithPosts } from '../../../../../helpers/templates/template_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

// const newTemplateName = nameGenerator.generate().spaced

// describe('use_template_full_as_subtask.cy', () => {
//   let user, fixture, newTemplate
//   const visitHelpers = new VisitHelpers()

//   before(() => {
//     cy.window().then(win => {
//       win.sessionStorage.clear()
//     })
//     createUser('', true, true, {
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
//                   name: 'MOON',
//                 },
//                 {
//                   name: 'SUN',
//                   properties: { status: 'done' },
//                 },
//               ],
//             },
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//     })
//   })

//   describe('When trying to use template task as a subtask of', () => {
//     before(() => {
//       cy.login(user.username)
//       createTemplate(newTemplateName, fixture.projects[0].id)
//         .then(template => {
//           newTemplate = template
//         })
//         .then(() => {
//           publishTemplate(newTemplate.id)
//           populateTemplateWithPosts(newTemplate)
//           visitHelpers.visitTemplateOverview(newTemplate.id)
//         })

//       it('should have map displayed', () => {
//         cy.get('[data-test=container]').should('have.length', 1)
//       })
//     })

//     const createSubtaskFromTemplateProject = (parentTaskName, levelLetter) => {
//       selectTemplateProjectAndConfirm()
//       cy.get('[data-test=existing-project-radio]').click()

//       templateSourceDialogPage.get.matterSelector().click()
//       cy.focused().type('UseTemplate')
//       cy.backendRoute(
//         '/matter/*/workstreams?excludeClosed=true&levelATasksOnly=false'
//       ).as('projectsFetch')
//       templateSourceDialogPage.get.matterSelectorItem().first().click()
//       templateSourceDialogPage.get.destinationSelect().click()
//       cy.wait(2000) // Last resort
//       templateSourceDialogPage.get.subtaskOf().click()

//       cy.backendRoute('GET', '/matter/*/workstreams/*/tasks**').as('tasksFetch')
//       templateSourceDialogPage.get
//         .taskSelectorInput()
//         .click()
//         .type(parentTaskName)
//       cy.wait('@tasksFetch', { timeout: 12000 })
//       templateSourceDialogPage.get
//         .taskSelectorItem()
//         .contains(`${levelLetter}. ${parentTaskName}`)
//         .click()
//       cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
//         'postNewTask'
//       )
//       templateSourceDialogPage.get.createButton().click()
//       cy.wait('@postNewTask', { timeout: 12000 })
//     }

//     describe('a NOT STARTED parent - ', () => {
//       before(() => {
//         createSubtaskFromTemplateProject('MOON', 'A')
//       })

//       snackbarHelper.checkShownAndHasExpectedText(
//         'Template tasks added to matter',
//         'open'
//       )

//       describe("click OPEN to navigate to the destination project's task map", () => {
//         before(() => {
//           snackbarHelper.clickActionButton()
//           cy.get('.reactour__close').click()
//         })

//         it('should have the correct url', () => {
//           cy.url().should(
//             'contain',
//             `/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap?id=${fixture.tasks[0].id}`
//           )
//         })

//         it('should have additional tasks', () => {
//           showDoneTasks()
//           // cy.get('body').click()
//           cy.get('[data-test=task-cell-test]').should(
//             'have.length',
//             fixture.tasks.length * 2
//           )
//         })

//         it('the new tasks should have Not Started status', () => {
//           // cy.get('[data-test=structureItem]')
//           //   .eq(2)
//           //   .should('have.css', 'background-color')
//           //   .and('be.colored', '#dbd9b5') //taskStatusColors.notStarted)
//           // cy.get('[data-test=structureItem]')
//           //   .eq(3)
//           //   .should('have.css', 'background-color')
//           //   .and('be.colored', '#dbd9b5') //taskStatusColors.notStarted)
//         })

//         it('should order the new tasks correctly', () => {
//           cy.get('[data-test=task-cell-test]')
//             .eq(2)
//             .find('[data-task-name]')
//             .should('have.text', 'SUN')
//           cy.get('[data-test=task-cell-test]')
//             .eq(3)
//             .find('[data-task-name]')
//             .should('have.text', 'MOON')
//         })
//       })
//     })

//     describe('a DONE parent - ', () => {
//       before(() => {
//         cy.login(user.username)
//         visitHelpers.visitTemplateOverview(newTemplate.id)
//         createSubtaskFromTemplateProject('SUN', 'A')
//       })

//       snackbarHelper.checkShownAndHasExpectedText(
//         "New tasks successfully created. New tasks marked as 'done' to reflect parent status",
//         'open'
//       )

//       describe('click OPEN to navigate to the created task details', () => {
//         before(() => {
//           snackbarHelper.clickActionButton()
//         })

//         it('should have the correct url', () => {
//           cy.url().should(
//             'contain',
//             `/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap?id=${fixture.tasks[1].id}`
//           )
//         })

//         it('should have additional tasks', () => {
//           showDoneTasks()
//           // cy.get('body').click()
//           cy.get('[data-test=task-cell-test]').should(
//             'have.length',
//             // 1 extra for root element of task map
//             fixture.tasks.length * 3
//           )
//         })

//         it('the new tasks should have Done status', () => {
//           cy.get('[data-test=task-cell-test]')
//             .eq(0)
//             .should('have.css', 'background-color')
//             .and('be.colored', taskStatusColors.done)
//         })

//         it('should order the new tasks correctly', () => {
//           cy.get('[data-test=task-cell-test]')
//             .eq(1)
//             .find('[data-task-name]')
//             .should('have.text', 'SUN')
//           cy.get('[data-test=task-cell-test]')
//             .eq(2)
//             .find('[data-task-name]')
//             .should('have.text', 'MOON')
//         })
//       })
//     })
//   })
// })
