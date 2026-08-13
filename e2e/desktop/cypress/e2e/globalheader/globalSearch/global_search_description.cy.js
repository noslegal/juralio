// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import { checkSearchResultDetails } from '../../../../../helpers/search/search-helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// describe('global_search_description.cy', () => {
//   let user, fixture

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'globalSearchDescriptionTest',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               tasks: [
//                 {
//                   properties: {
//                     name: 'task1',
//                     description: 'This is some text.',
//                   },
//                 },
//                 {
//                   properties: {
//                     name: 'task2',
//                   },
//                 },
//                 {
//                   properties: {
//                     name: 'task3',
//                     description:
//                       '\n\nWords for the test that do not mean things but take up space!',
//                   },
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

//   describe('when navigating to the task map', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
//       )
//     })

//     describe('And a search is performed in the global search box', () => {
//       before(() => {
//         cy.get('[data-test=global-searchbar]').find('input').type('task')
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })

//       it('should populate 3 results', () => {
//         cy.get('[data-test=search-result-item]', { timeout: 30000 }).should(
//           'have.length',
//           3
//         )
//       })

//       checkSearchResultDetails(1, 'task2', undefined, 'Phase of ', undefined)

//       checkSearchResultDetails(
//         2,
//         'task1',
//         'This is some text.',
//         'Phase of ',
//         undefined
//       )

//       checkSearchResultDetails(
//         0,
//         'task3',
//         'Words for the test that do not mean things but take up space!',
//         'Phase of ',
//         undefined
//       )

//       describe('And a search is performed on a term in the description field.', () => {
//         before(() => {
//           cy.get('[data-test=global-searchbar]')
//             .find('input')
//             .clear()
//             .type('mean')
//         })

//         it('should populate 1 result', () => {
//           cy.get('[data-test=search-result-item]').should('have.length', 1)
//         })

//         checkSearchResultDetails(
//           0,
//           'task3',
//           'Words for the test that do not mean things but take up space!',
//           'Phase of ',
//           undefined
//         )
//       })

//       describe('And a search is performed on a term in the description field.', () => {
//         before(() => {
//           cy.get('[data-test=global-searchbar]')
//             .find('input')
//             .clear()
//             .type('text')
//         })

//         it('should populate 1 result', () => {
//           cy.get('[data-test=search-result-item]').should('have.length', 1)
//         })

//         checkSearchResultDetails(
//           0,
//           'task1',
//           'This is some text.',
//           'Phase of ',
//           undefined
//         )
//       })
//     })
//   })
// })
