// import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'
// import {
//   getProjectAtoCLevelData,
//   getProjectAtoCLevelDataDiffNames,
// } from '../../../../../helpers/data/task_operations_test_project_data'
// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

// const visitHelpers = new VisitHelpers()

// describe('global_search_flow.cy', () => {
//   let user, fixture2, seed2

//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'search',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: getProjectAtoCLevelData(),
//         },
//       }

//       seed2 = {
//         matter: {
//           prefix: 'search',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: getProjectAtoCLevelDataDiffNames(),
//         },
//       }

//       generateFixture(seed)
//       fixture2 = generateFixture(seed2)
//     })
//   })

//   describe('when searching within first matters taskmap for a task name', () => {
//     before(() => {
//       cy.login(user.username)
//       visitHelpers.visitTaskMap(fixture2.matter.id, fixture2.projects[0].id)
//     })

//     describe('And a search is performed in the global search box for a task name', () => {
//       before(() => {
//         cy.backendRoute('/matter/*/workstreams/*/search**').as('searchProject')
//         cy.clock()

//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .type('task1')
//         cy.tick(1000)
//         cy.wait('@searchProject')
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })
//       it('should populate 1 result', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 1)
//       })

//       describe('a search result should display', () => {
//         it('should render the correct level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should(
//             'have.text',
//             'A'
//           )
//         })

//         it('should Not render the project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'not.exist'
//           )
//         })

//         it('should render the correct name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should(
//             'have.text',
//             fixture2.tasks[0].name
//           )
//         })

//         it('should render the correct reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'have.text',
//             fixture2.tasks[0].referenceNumber
//           )
//         })
//       })
//     })

//     describe('And a search is performed in the global search box for a J number', () => {
//       before(() => {
//         cy.backendRoute('/matter/*/workstreams/*/search**').as('searchProject')
//         cy.clock()
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .clear()
//           .type('JUR1')
//         cy.tick(1000)
//         cy.wait('@searchProject')
//         cy.wait(5000)
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })

//       it('should populate 1 result', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 1)
//       })

//       describe('a search result should display', () => {
//         it('should render the correct level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should(
//             'have.text',
//             'A'
//           )
//         })

//         it('should Not render the project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'not.exist'
//           )
//         })

//         it('should render the correct name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should(
//             'have.text',
//             fixture2.tasks[0].name
//           )
//         })

//         it('should render the correct reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'have.text',
//             fixture2.tasks[0].referenceNumber
//           )
//         })
//       })
//     })
//   })

//   describe('when searching within the second matter', () => {
//     before(() => {
//       cy.login(user.username)
//       visitHelpers.visitTaskMap(fixture2.matter.id, fixture2.projects[1].id)
//     })

//     describe('it should be on correct matter', () => {
//       it('should be on correct matter', () => {
//         cy.url().should('include', `matter/${fixture2.matter.id}/`)
//       })
//     })

//     describe('And a search is performed in the global search box for a task name', () => {
//       before(() => {
//         cy.backendRoute('/matter/*/workstreams/*/search**').as('searchProject')
//         cy.clock()
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .type('task1')
//         cy.tick(1000)
//         cy.wait('@searchProject')
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })
//       it('should populate 1 result', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 1)
//       })

//       describe('a search result should display', () => {
//         it('should render the correct level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should(
//             'have.text',
//             'A'
//           )
//         })

//         it('should Not render the project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'not.exist'
//           )
//         })

//         it('should render the correct name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should(
//             'have.text',
//             fixture2.tasks[8].name
//           )
//         })

//         it('should render the correct reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'have.text',
//             fixture2.tasks[8].referenceNumber
//           )
//         })
//       })
//     })
//     describe('And a search is performed in the global search box for a J number', () => {
//       before(() => {
//         cy.backendRoute('/matter/*/workstreams/*/search**').as('searchProject')
//         cy.clock()
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .clear()
//           .type('JUR1')
//         cy.tick(1000)
//         cy.wait('@searchProject')
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })

//       it('should populate 1 result', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 1)
//       })

//       describe('a search result should display', () => {
//         it('should render the correct level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should(
//             'have.text',
//             'A'
//           )
//         })

//         it('should Not render the project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'not.exist'
//           )
//         })

//         it('should render the correct name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should(
//             'have.text',
//             fixture2.tasks[8].name
//           )
//         })

//         it('should render the correct reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'have.text',
//             fixture2.tasks[8].referenceNumber
//           )
//         })
//       })
//     })
//   })

//   describe('when searching across matters from home screen', () => {
//     before(() => {
//       cy.get('[data-test=home-navigation]').click()
//     })

//     describe('And a search is performed in the global search box for a task name', () => {
//       before(() => {
//         cy.backendRoute('/universal/search**').as('searchUniversal')
//         cy.clock()
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .type('task1')
//         cy.tick(1000)
//         cy.wait('@searchUniversal')
//         cy.wait(5000)
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })

//       it('should populate 2 results', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 2)
//       })

//       describe('the first search result should contain', () => {
//         it('should render a level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should('be.visible')
//         })

//         it('should render a project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'be.visible'
//           )
//         })

//         it('should render a task name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should('be.visible')
//         })

//         it('should render a reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'be.visible'
//           )
//         })
//       })

//       describe('the second search result should contain', () => {
//         it('should render a level', () => {
//           cy.get('[data-test=global-search-item-level-1]').should('be.visible')
//         })

//         it('should render a project name', () => {
//           cy.get('[data-test=global-search-item-project-name-1]').should(
//             'be.visible'
//           )
//         })

//         it('should render a task name', () => {
//           cy.get('[data-test=global-search-item-name-1]').should('be.visible')
//         })

//         it('should render a reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-1]').should(
//             'be.visible'
//           )
//         })
//       })
//     })
//     describe('searching for a J number across matters', () => {
//       before(() => {
//         cy.backendRoute('/universal/search**').as('searchUniversal')
//         cy.clock()
//         cy.get('[data-test=global-header-searchbar]')
//           .find('input')
//           .clear()
//           .type('JUR1')
//         cy.tick(1000)
//         cy.wait('@searchUniversal')
//         cy.wait(5000)
//       })

//       it('should render the search results container', () => {
//         cy.get('[data-test=search-results-list]').should('be.visible')
//       })

//       it('should populate 2 results', () => {
//         cy.get('[data-test=global-search-item]').should('have.length', 2)
//       })

//       describe('the first search result should contain', () => {
//         it('should render a level', () => {
//           cy.get('[data-test=global-search-item-level-0]').should('be.visible')
//         })

//         it('should render a project name', () => {
//           cy.get('[data-test=global-search-item-project-name-0]').should(
//             'be.visible'
//           )
//         })

//         it('should render a task name', () => {
//           cy.get('[data-test=global-search-item-name-0]').should('be.visible')
//         })

//         it('should render a reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-0]').should(
//             'be.visible'
//           )
//         })
//       })

//       describe('the second search result should contain', () => {
//         it('should render a level', () => {
//           cy.get('[data-test=global-search-item-level-1]').should('be.visible')
//         })

//         it('should render a project name', () => {
//           cy.get('[data-test=global-search-item-project-name-1]').should(
//             'be.visible'
//           )
//         })

//         it('should render a task name', () => {
//           cy.get('[data-test=global-search-item-name-1]').should('be.visible')
//         })

//         it('should render a reference number', () => {
//           cy.get('[data-test=global-search-item-referencenumber-1]').should(
//             'be.visible'
//           )
//         })
//       })
//     })
//   })
// })
