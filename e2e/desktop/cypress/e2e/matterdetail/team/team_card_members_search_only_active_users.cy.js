// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { changeUserActiveStatus } from '../../../../../helpers/users/user_helper'

// const visitHelpers = new VisitHelpers()
// const disabledUserPrefix = new Date().getTime().toString()

// describe('team_card_members_search_only_active_users.cy', () => {
//   let appPage, fixture
//   let user1, user2, user3

//   before(() => {
//     //Prefix is used to generate users in order to test ordering
//     const createUser1 = () =>
//       createUser('Y').then(createdUser => (user1 = createdUser))
//     const createUser2 = () =>
//       createUser('F').then(createdUser => (user2 = createdUser))
//     const createUser3 = () =>
//       createUser(disabledUserPrefix).then(createdUser => (user3 = createdUser))

//     createUser1()
//       .then(createUser2)
//       .then(createUser3)
//       .then(() => {
//         const seed = {
//           matter: {
//             prefix: 'ttmHideInactiveSearchSpec',
//             teamMembers: [user1, user2],
//             matterAdmins: [user1],
//             projects: [
//               {
//                 name: 'Test Project',
//                 tasks: [
//                   {
//                     name: 'Transfer Documents',
//                     teamMembers: [user2],
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

//   describe('When visiting a matters details page', () => {
//     before(() => {
//       visitHelpers.visitMatter(fixture.matter.id)
//       cy.get('[data-test=matter-people]').click()
//       cy.wait(2000)
//       searchInput().type(disabledUserPrefix)
//     })

//     it('should yield 1 result', () => {
//       cy.get('[data-test=add-user-flow-autocomplete-option]').should(
//         'have.length',
//         1
//       )
//     })

//     describe('When navigating to a task and attempting to search for an inactive user account', () => {
//       before(() => {
//         cy.login(user1.username)
//         visitHelpers.visitOrgUsers()
//         changeUserActiveStatus(user3)
//         visitHelpers.visitMatter(fixture.matter.id)
//         cy.get('[data-test=matter-people]').click()

//         searchInput().type(disabledUserPrefix)
//         cy.wait(2000)
//       })

//       it('should yield no results', () => {
//         cy.get('[data-test=add-user-flow-autocomplete-no-options]').should(
//           'be.visible'
//         )
//       })
//     })
//   })
// })

// function searchInput() {
//   cy.wait(5000)
//   cy.get('[data-test=add-user-matter-button]').click()
//   return cy.get('[data-test=add-user-flow-autocomplete]').find('input').clear()
// }
