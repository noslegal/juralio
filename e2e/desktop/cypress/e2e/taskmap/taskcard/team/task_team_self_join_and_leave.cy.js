// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../helpers/users/user_api_helper'

// describe('task_team_self_join_and_leave.cy', () => {
//   let user1, user2, fixture, appPage

//   before(() => {
//     const createUser1 = () => {
//       return createUser().then(createdUser => (user1 = createdUser))
//     }

//     const createUser2 = () => {
//       return createUser().then(createdUser => (user2 = createdUser))
//     }

//     createUser1()
//       .then(createUser2)
//       .then(() => {
//         const seed = {
//           matter: {
//             prefix: 'tfDisplaySpec',
//             teamMembers: [user1, user2],
//             matterAdmins: [user1],
//             projects: [
//               {
//                 name: 'Test Project',
//                 tasks: [
//                   { name: 'Without Follower' },
//                   { name: 'With Follower', followers: [user2] },
//                 ],
//               },
//             ],
//           },
//         }

//         fixture = generateFixture(seed)
//         appPage = getWrapper(fixture)
//       })
//   })

//   describe('When visiting a task as neither TM or TF', () => {
//     before(() => {
//       cy.login(user2.username)
//       appPage.visitTaskByName('Without Follower')
//     })

//     it(' button should have the text "Join"', () => {
//       cy.get('[data-test="join-team-button"]').should('have.text', 'Join')
//     })

//     it('should display a single task team member', () => {
//       cy.get('[data-test="user-list-item"]').should('have.length', 1)
//     })

//     describe('When the task team button is clicked', () => {
//       before(() => {
//         cy.get('[data-test="join-team-button"]').click()
//       })

//       it('User should be added to list and remove from team button shown"', () => {
//         cy.get('[data-test="on-the-team-button"]')
//           .scrollIntoView()
//           .should('be.visible')
//         cy.get('[data-test="user-list-item"]').should('have.length', 2)
//       })

//       describe('When the leave team button is clicked', () => {
//         before(() => {
//           cy.get('[data-test="on-the-team-button"]').click()
//         })

//         it('User should be removed from list and join team button shown', () => {
//           cy.get('[data-test="join-team-button"]')
//             .scrollIntoView()
//             .should('be.visible')
//           cy.get('[data-test="user-list-item"]').should('have.length', 1)
//         })
//       })
//     })
//   })

//   describe('When visiting a task as a TF, but not a TM', () => {
//     before(() => {
//       cy.login(user2.username)
//       appPage.visitTaskByName('With Follower')
//     })

//     it('button should have the text "Join"', () => {
//       cy.get('[data-test="join-team-button"]').should('have.text', 'Join')
//     })

//     it('should display a single task team member', () => {
//       cy.get(
//         '[data-test=team-members-container] [data-test=user-list-item]'
//       ).should('have.length', 1)
//     })

//     it('should display a single task team follower', () => {
//       cy.get('[data-test=task-followers] [data-test=user-list-item]').should(
//         'have.length',
//         1
//       )
//     })

//     describe('When a TF adds themself as a TM via the "join" button', () => {
//       before(() => {
//         cy.backendRoute('DELETE', '/matter/*/workstreams/*/task/*/followers/*').as(
//           'deleteTF'
//         )
//         cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/teammembers').as(
//           'postTM'
//         )
//         cy.get('[data-test="join-team-button"]').click()
//         cy.wait(['@deleteTF', '@postTM'])
//       })

//       it('User should be added to list and remove from team button shown"', () => {
//         cy.get('[data-test="on-the-team-button"]')
//           .scrollIntoView()
//           .should('be.visible')
//         cy.get(
//           '[data-test=team-members-container] [data-test="user-list-item"]'
//         ).should('have.length', 2)
//       })

//       it('should no longer display any task team followers', () => {
//         cy.get('[data-test=task-followers] [data-test=user-list-item]').should(
//           'have.length',
//           0
//         )
//         cy.get('[data-test=task-followers-zero-state]')
//           .scrollIntoView()
//           .should('be.visible')
//       })

//       it('should no longer display the "follow" button', () => {
//         cy.get('[data-test=followers-button]').should('not.exist')
//       })

//       describe('When the leave team button is clicked', () => {
//         before(() => {
//           cy.get('[data-test="on-the-team-button"]').click()
//         })

//         it('User should be removed from list and join team button shown', () => {
//           cy.get('[data-test="join-team-button"]')
//             .scrollIntoView()
//             .should('be.visible')
//           cy.get('[data-test="user-list-item"]').should('have.length', 1)
//         })

//         it('should display the "follow" button', () => {
//           cy.get('[data-test=followers-button]').should('be.visible')
//         })
//       })
//     })

//     describe('When a TF adds themself as a TM via the search bar', () => {
//       before(() => {
//         cy.clock()
//         cy.backendRoute('POST', '/users/search').as('postSearch')
//         cy.get('[data-test="team-search"]')
//           .find('input')
//           .clear()
//           .type(user2.username)
//         cy.tick(1000)
//         cy.wait('@postSearch')
//         cy.get('[data-test="search-result-list-item"]')
//           .eq(0)
//           .click()
//       })

//       it('User should be added to list and remove from team button shown"', () => {
//         cy.get('[data-test="on-the-team-button"]')
//           .scrollIntoView()
//           .should('be.visible')
//         cy.get(
//           '[data-test=team-members-container] [data-test="user-list-item"]'
//         ).should('have.length', 2)
//       })

//       it('should no longer display any task team followers', () => {
//         cy.get('[data-test=task-followers] [data-test=user-list-item]').should(
//           'have.length',
//           0
//         )
//         cy.get('[data-test=task-followers-zero-state]')
//           .scrollIntoView()
//           .should('be.visible')
//       })

//       it('should no longer display the "follow" button', () => {
//         cy.get('[data-test=followers-button]').should('not.exist')
//       })

//       describe('When the leave team button is clicked', () => {
//         before(() => {
//           cy.get('[data-test="on-the-team-button"]').click()
//         })

//         it('User should be removed from list and join team button shown', () => {
//           cy.get('[data-test="join-team-button"]')
//             .scrollIntoView()
//             .should('be.visible')
//           cy.get('[data-test="user-list-item"]').should('have.length', 1)
//         })

//         it('should display the "follow" button', () => {
//           cy.get('[data-test=followers-button]').should('be.visible')
//         })
//       })
//     })
//   })
// })
