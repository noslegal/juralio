// import {
//     generateFixture,
//     getWrapper
// } from '../../../../helpers/matterprojects/fixture_helper'
// import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
// import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
// import { createUser } from '../../../../helpers/users/user_api_helper'

// const visitHelpers = new VisitHelpers()

// describe('timeline_display_new_tasks_snackbar.cy', () => {
//   let fixture, appPage, user1, user2

//   const createUser1 = () =>
//     createUser().then(createdUser => (user1 = createdUser))
//   const createUser2 = () =>
//     createUser().then(createdUser => (user2 = createdUser))

//   before(() => {
//     createUser1()
//       .then(createUser2)
//       .then(() => {
//         const seed = {
//           matter: {
//             prefix: 'task_moved_event',
//             teamMembers: [user1, user2],
//             matterAdmins: [user1],
//             projects: [
//               {
//                 name: 'Alpha Project',
//                 tasks: [
//                   {
//                     name: 'Moon',
//                     tasks: [
//                       {
//                         name: 'Pluto',
//                         followers: [user2],
//                         properties: {
//                           description: 'Pluto description',
//                         },
//                       },
//                       {
//                         name: 'Mars',
//                         teamMembers: [user2],
//                         properties: {
//                           description: 'Mars description',
//                         },
//                       },
//                       {
//                         name: 'Jupiter',
//                         teamMembers: [user2],
//                         properties: {
//                           description: 'Jupiter description',
//                         },
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//         }
//         fixture = generateFixture(seed)
//         appPage = getWrapper(fixture)
//       })
//   })

//   describe('when the user first visits the project', () => {
//     before(() => {
//       cy.login(user1.username)
//       visitHelpers.visitProjectTimeLine(
//         fixture.matter.id,
//         fixture.projects[0].id,
//         fixture.tasksMappedByName['Moon'].id
//       )
//     })

//     describe('then another user creates a task', () => {
//       before(() => {
//         cy.login(user2.username)
//         appPage.visitHome()
//         createTask(
//           fixture.matter.id,
//           fixture.projects[0].id,
//           'not-started',
//           'a new task by another user'
//         )
//       })

//       describe('and then the user revisits the project', () => {
//         before(() => {
//           cy.login(user1.username)
//           visitHelpers.visitProjectTimeLine(
//             fixture.matter.id,
//             fixture.projects[0].id,
//             fixture.tasksMappedByName['Moon'].id
//           )
//         })

//         it('should not show a snackbar saying 1 new task added', () => {
//           cy.get('[data-test=snackbar-message]', { timeout: 10000 }).should(
//             'not.exist'
//           )
//         })

//         describe('and the user refreshes the page', () => {
//           before(() => {
//             cy.login(user1.username)
//             appPage.visitTaskMap()
//           })

//           it('should not reshow the snackbar', () => {
//             cy.get('[data-test=snackbar-message]').should('not.exist')
//           })
//         })

//         after(() => {
//           // A project visit is recorded when the user leaves the taskmap (componentWillUnmount)
//           appPage.visitHome()
//         })
//       })
//     })
//   })

//   describe('when the user first visits the project', () => {
//     before(() => {
//       cy.login(user1.username)
//       visitHelpers.visitProjectTimeLine(
//         fixture.matter.id,
//         fixture.projects[0].id,
//         fixture.tasksMappedByName['Moon'].id
//       )
//     })

//     describe('then another user creates another task', () => {
//       before(() => {
//         cy.login(user2.username)
//         appPage.visitHome()
//         createTask(
//           fixture.matter.id,
//           fixture.projects[0].id,
//           'not-started',
//           'another new task by another user A'
//         )
//         createTask(
//           fixture.matter.id,
//           fixture.projects[0].id,
//           'not-started',
//           'another new task by another user B'
//         )
//       })

//       describe('and then the user revisits the project', () => {
//         before(() => {
//           cy.login(user1.username)
//           visitHelpers.visitProjectTimeLine(
//             fixture.matter.id,
//             fixture.projects[0].id,
//             fixture.tasksMappedByName['Moon'].id
//           )
//         })

//         it('should not show a snackbar saying 2 new task added', () => {
//           cy.get('[data-test=snackbar-message]').should('not.exist')
//         })

//         describe('and the user refreshes the page', () => {
//           before(() => {
//             cy.login(user1.username)
//             appPage.visitTaskMap()
//           })

//           it('should not reshow the snackbar', () => {
//             cy.get('[data-test=snackbar-message]').should('not.exist')
//           })
//         })

//         after(() => {
//           // A project visit is recorded when the user leaves the taskmap (componentWillUnmount)
//           appPage.visitHome()
//         })
//       })
//     })
//   })
// })
