// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// describe('global_search_filter.cy', () => {
//   let user, fixture1, seed2, appPage

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'search',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'P1',
//               tasks: [{ name: 'Med' }],
//             },
//             {
//               name: 'P2',
//               tasks: [{ name: 'Medi' }],
//             },
//           ],
//         },
//       }

//       seed2 = {
//         matter: {
//           prefix: 'search',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'P3',
//               tasks: [{ name: 'Medicine' }],
//             },
//           ],
//         },
//       }

//       fixture1 = generateFixture(seed)
//       appPage = getWrapper(fixture1)
//       generateFixture(seed2)
//     })
//   })

//   describe('when in context of a project', () => {
//     before(() => {
//       cy.login(user.username)
//       appPage.visitTaskMap()
//     })

//     describe('and searching using a search term that may match tasks within this projects and other projects', () => {
//       before(() => {
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .type('Med')
//       })

//       it('the "Search everything" option should be visible', () => {
//         cy.get('[data-test=search-everything-filter]')
//           .should('be.visible')
//           .should('contain', 'Search everything')
//       })

//       it('initally only results matching the search term in THIS project should be displayed', () => {
//         cy.get('[data-test=global-search-item]')
//           .should('have.length', 1)
//           .should('contain', 'Med')
//       })

//       describe('when clicking the "Search everything" option', () => {
//         before(() => {
//           cy.clock()
//           cy.backendRoute('/universal/search?searchTerm=Med').as(
//             'searchEverything'
//           )
//           cy.get('[data-test=search-everything-filter]').click('center')
//           cy.wait('@searchEverything')
//           cy.wait(5000)
//         })

//         it('the "Search everything" option should no longer be displayed', () => {
//           cy.get('[data-test=search-everything-filter]').should(
//             'not.be.visible'
//           )
//         })

//         it('results matching the term from other projects and matters should be displayed', () => {
//           cy.get('[data-test=global-search-item]')
//             .should('have.length', 3)
//             .should('contain', 'Med')
//             .should('contain', 'Medi')
//             .should('contain', 'Medicine')
//         })

//         describe('when making the search term more specific', () => {
//           before(() => {
//             cy.get('[data-test=global-header-searchbar]')
//               .find('input')
//               .clear('left')
//               .type('Medi')
//           })

//           it('the search should coninue to be conducted against all matters', () => {
//             cy.get('[data-test=global-search-item]')
//               .should('have.length', 2)
//               .should('contain', 'Medi')
//               .should('contain', 'Medicine')
//           })
//         })
//       })

//       describe('when closing the search results pop up and re-opening it', () => {
//         before(() => {
//           // cy.get('body').click()
//           cy.get('[data-test=global-header-searchbar]')
//             .find('input')
//             .type('Med')
//         })

//         it('the "search everything" option should be visible', () => {
//           cy.get('[data-test=search-everything-filter]').should('be.visible')
//         })

//         it('initally only results matching the search term in THIS project should be displayed', () => {
//           cy.get('[data-test=global-search-item]')
//             .should('have.length', 1)
//             .should('contain', 'Med')
//         })
//       })
//     })
//   })
// })
