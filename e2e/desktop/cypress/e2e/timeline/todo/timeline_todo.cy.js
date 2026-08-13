// import {
//     getProjectAtoCLevelData,
//     getProjectAtoCLevelDataDiffNames
// } from '../../../../../helpers/data/task_operations_test_project_data'
// import { updatePED } from '../../../../../helpers/date/date_api_helper'
// import {
//     generateFixture,
//     getWrapper
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// describe('timeline_todo.cy', () => {
//   let user
//   let seed
//   let appPage
//   let fixture

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       seed = {
//         matter: {
//           prefix: 'todo1 ',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             getProjectAtoCLevelData()[0],
//             getProjectAtoCLevelDataDiffNames()[0],
//           ],
//         },
//       }

//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('When visiting the project timeline when no task dates are set', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitProjectTimeLine(0)
//     })

//     it('should not render any todo items', () => {
//       cy.get('[data-test=todo-item]').should('have.length', 0)
//     })
//   })

//   describe('When visiting the project timeline when a single task date is set', () => {
//     before(() => {
//       cy.login(user.username)

//       let project = fixture.projects[0]
//       updatePEDforProject1(fixture, project).then(() =>
//         appPage.visitProjectTimeLine(0)
//       )
//     })

//     it('should render a single todo item', () => {
//       cy.get('[data-test=todo-item]').should('have.length', 1)
//     })

//     checkProjectTodoItem(0, 'task1')
//   })

//   describe('When visiting the project timeline when task dates are set', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitProjectTimeLine(1)

//       let project = fixture.projects[1]
//       updatePEDforProject2(fixture, project)
//     })

//     it('should render any todo items', () => {
//       cy.get('[data-test=todo-item]').should('have.length', 4)
//     })

//     checkProjectTodoItem(0, 'diff subtask7')
//     checkProjectTodoItem(1, 'diff subtask6')
//     checkProjectTodoItem(2, 'diff subtask5')
//     checkProjectTodoItem(3, 'diff task2')
//   })
// })

// function checkProjectTodoItem(index, name) {
//   it('should render a name - ' + name, () => {
//     cy.get('[data-test=todo-list] [data-test=todo-item]')
//       .eq(index)
//       .find('[data-test=todo-item-name]')
//       .should('have.text', name)
//   })
// }

// function updatePEDforProject1(fixture, project) {
//   return updatePED(fixture.matter.id, project.id, fixture.tasks[0].id, '-', 4)
// }

// function updatePEDforProject2(fixture, project) {
//   updatePED(fixture.matter.id, project.id, fixture.tasks[15].id, '-', 4).then(
//     response => {
//       updatePED(
//         fixture.matter.id,
//         project.id,
//         fixture.tasks[14].id,
//         '+',
//         0
//       ).then(response => {
//         updatePED(
//           fixture.matter.id,
//           project.id,
//           fixture.tasks[13].id,
//           '+',
//           1
//         ).then(response => {
//           updatePED(
//             fixture.matter.id,
//             project.id,
//             fixture.tasks[12].id,
//             '+',
//             7
//           ).then(response => {
//             cy.reload()
//           })
//         })
//       })
//     }
//   )
// }
