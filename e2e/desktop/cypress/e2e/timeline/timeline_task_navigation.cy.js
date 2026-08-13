// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../helpers/users/user_api_helper'

// describe('timeline_task_navigation.cy', () => {
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
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//     })
//   })

//   const clickFirstTask = () =>
//     cy.get('[data-test=task-browser-bar]').eq(1).click()

//   // regression test for project-level navigation with a trailing slash
//   describe('when at the project level with a trailing slash', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/timeline/`
//       )
//     })

//     it('clicking the first task should update the url', () => {
//       clickFirstTask()
//       cy.url().should('contain', `task/${fixture.tasks[0].id}/timeline`)
//     })
//   })

//   describe('when at the project level with no trailing slash', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/timeline`
//       )
//     })

//     it('clicking the first task should update the url', () => {
//       clickFirstTask()
//       cy.url().should('contain', `task/${fixture.tasks[0].id}/timeline`)
//     })
//   })
// })
