// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../helpers/matterprojects/fixture_helper'
// import {
//   checkTaskMapLevelAndDepthCounts,
//   clickTaskCellForTaskWithName,
// } from '../../../../../../helpers/taskmap/task-map-helper'
// import { createUser } from '../../../../../../helpers/users/user_api_helper'
// import { getTaskDestinationProjects } from '../../../../../../helpers/data/task_operations_test_project_data'
// import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'
// import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
// import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'

// describe('template_task_move_to_destinations.cy', () => {
//   let user, appPage, fixture
//   let { moveDialog } = taskDetailPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'TTMoveToTTDestination',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: getTaskDestinationProjects(),
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('When moving tasks within a template', () => {
//     let templateId
//     before(() => {
//       cy.login(user.username)
//       createTemplate('New Template', fixture.projects[0].id).then(template => {
//         templateId = template.id
//       })
//     })

//     // describe('When the Level D task is moved to Level B', () => {
//     //   before(() => {
//     //     cy.login(user.username)
//     //     appPage.visitTemplateTaskMap(templateId)
//     //     clickTaskCellForTaskWithName('Beetle')
//     //     openTemplateTaskMove()
//     //     moveDialog.get.destinationSelectionDropdown().click()
//     //     moveDialog.get.destinationOption.newTask().click()

//     //     cy.clock()
//     //     moveDialog.get.destinationTextField().type('Dog')
//     //     cy.tick(1000)

//     //     cy.get('[data-test=task-item-name-0]').click()

//     //     cy.backendRoute('POST', '/projecttemplates/*/tasks/*/move').as(
//     //       'templateTaskMove'
//     //     )
//     //     cy.wait(2000)
//     //     moveDialog.get.moveButton().click()
//     //     cy.wait('@templateTaskMove')

//     //     cy.wait(2500) // Task cell was not sized so unclickable. Wait until D3 sizes it.
//     //   })

//     //   checkTaskMapLevelAndDepthCounts([
//     //     { depth: 1, expectedCount: 4 },
//     //     { depth: 2, expectedCount: 4 },
//     //     { depth: 3, expectedCount: 2 },
//     //     { depth: 4, expectedCount: 1 },
//     //   ])
//     // })
//   })
// })
