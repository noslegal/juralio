// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../helpers/users/user_api_helper'

// import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
// import { removeTeamMember } from '../../../../../helpers/tasks/tasks_api_helper'
// import { openSelector } from '../../../../../helpers/navigation/project-selector-helper'

// const visitHelper = new VisitHelpers()

// describe(
//   'task_map_add_assignee.cy',
//   { retries: { runMode: 3, openMode: 1 } },
//   () => {
//     let fixture, appPage, user1, user2, user3, user4, user5, onlyAdminUser

//     const createUser1 = () =>
//       createUser().then(createdUser => (user1 = createdUser))
//     const createUser2 = () =>
//       createUser().then(createdUser => (user2 = createdUser))
//     const createUser3 = () =>
//       createUser().then(createdUser => (user3 = createdUser))
//     const createUser4 = () =>
//       createUser().then(createdUser => (user4 = createdUser))
//     const createUser5 = () =>
//       createUser().then(createdUser => (user5 = createdUser))
//     const createOnlyAdminUser = () =>
//       createUser().then(createdUser => (onlyAdminUser = createdUser))

//     before(() => {
//       createUser1()
//         .then(createUser2)
//         .then(createUser3)
//         .then(createUser4)
//         .then(createUser5)
//         .then(createOnlyAdminUser)
//         .then(() => {
//           const seed = {
//             matter: {
//               prefix: 'task_moved_event',
//               teamMembers: [user1, user2, user3, user4, user5],
//               matterAdmins: [user1, onlyAdminUser],
//               projects: [
//                 {
//                   name: 'Alpha Project',
//                   tasks: [
//                     {
//                       name: 'Moon',
//                       teamMembers: [],
//                     },
//                   ],
//                 },
//               ],
//             },
//           }
//           fixture = generateFixture(seed)
//           appPage = getWrapper(fixture)
//         })
//     })

//     describe('when viewing the taskmap', () => {
//       before(() => {
//         cy.login(user1.username)
//         visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
//       })
//       it('should show the cell with no team members', () => {
//         cy.get('[data-test=task-cell-assignee-chip]')
//           .eq(0)
//           .find('[data-test=task-cell-zero-assignee-chip]')
//           .should('exist')
//       })
//       describe('hovering over the assignee chip', () => {
//         before(() => {
//           cy.get('[data-test=task-cell-assignee-chip]')
//             .eq(0)
//             .trigger('mouseover')
//         })
//         it('should show a tooltip', () => {
//           cy.get('.generic-tooltip')
//             .eq(0)
//             .should('have.text', 'Add team member')
//         })
//       })
//       describe('clicking the chip', () => {
//         before(() => {
//           cy.get('[data-test=task-cell-assignee-chip]').eq(0).click()
//         })
//         it('should open the assign user popover', () => {
//           cy.get('[data-test=add-assignee-popover]').should('exist')
//         })
//         it('should list some user choices', () => {
//           cy.get('[data-test=name-text]').eq(0).should('have.text', 'You')
//           cy.get('[data-test=team-search]').click().type(user2.firstname)
//           cy.wait(2000)
//           cy.get('[data-test=search-result-list-item]')
//             .eq(0)
//             .should(
//               'contain',
//               `${user2.firstname} ${user2.lastname} (${user2.username})`
//             )
//         })

//         describe('when search for an admin only user (not an editor)', () => {
//           before(() => {
//             cy.get('[data-test=team-search]')
//               .click('top')
//               .type(onlyAdminUser.firstname)
//             cy.wait(2000)
//           })
//           it('should not show a search result', () => {
//             cy.get('[data-test=no-results-search]').should('be.visible')
//             cy.get('[data-test=search-result-list-item]').should('not.exist')
//           })
//         })

//         describe('when selecting another matter in the matter switcher and going back to the assignee box', () => {
//           before(() => {
//             openSelector()
//             cy.wait(5000)

//             cy.get('[data-test=matter-switcher-matter-item]')
//               .eq(0)
//               .click({ timeout: 30000 })
//             cy.get('[data-test=matter-switcher-workstream-chip]').click({
//               timeout: 30000,
//             })
//             cy.get('[data-test=taskmap-navigation]').click({ timeout: 30000 })
//             cy.wait(1000)
//             cy.get('[data-test=task-cell-assignee-chip]', { timeout: 30000 })
//               .eq(0)
//               .click({ timeout: 30000 })
//             cy.wait(5000)
//           })

//           it('should list the same user choices', () => {
//             cy.get('[data-test=name-text]').eq(0).should('have.text', 'You')
//             cy.get('[data-test=team-search]').click().type(user1.firstname)
//             cy.wait(2000)
//             cy.get('[data-test=search-result-list-item]')
//               .eq(0)
//               .should(
//                 'contain',
//                 `${user1.firstname} ${user1.lastname} (${user1.username})`
//               )
//           })
//         })
//       })
//       describe('clicking a suggested user', () => {
//         before(() => {
//           cy.get('[data-test=search-result-list-item]').eq(0).click()
//         })
//         it('should set the assinged user to that user', () => {
//           cy.get('[data-test=add-assignee-popover]', { timeout: 30000 }).should(
//             'not.exist'
//           )
//           cy.get('[data-test=task-cell-zero-assignee-chip]').should('not.exist')
//           cy.get('[data-test=task-cell-assignee-avatar]').should('exist')
//           cy.get('[data-test=task-cell-assignee-avatar]').should(
//             'have.length',
//             1
//           )
//           cy.get('[data-test=task-cell-assignee-avatar]')
//             .eq(0)
//             .should('have.text', `${user1.firstname[0]}${user1.lastname[0]}`)
//         })
//       })
//       describe('using the search functionality', () => {
//         before(() => {
//           removeTeamMember(
//             fixture.matter.id,
//             fixture.projects[0].id,
//             fixture.tasks[0].id,
//             user1.id
//           )
//           cy.login(user1.username)
//           visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
//           cy.wait(5000)
//           cy.get('[data-test=task-cell-assignee-chip]').eq(0).click()
//           cy.get('[data-test=auto-complete-search-term]')
//             .find('input')
//             .eq(0)
//             .type(user1.firstname)
//         })
//         it('should hide the suggestions', () => {
//           cy.get('[data-test=name-text]').should('not.exist')
//         })
//         it('should show matching users in the matter team', () => {
//           cy.get('[data-test=search-result-list-item]').eq(0).should('exist')
//           cy.get('[data-test=search-result-list-item]')
//             .eq(0)
//             .contains(
//               `${user1.firstname} ${user1.lastname} (${user1.username})`
//             )
//         })
//         describe('clicking the matched user', () => {
//           before(() => {
//             cy.get('[data-test=search-result-list-item]', { timeout: 30000 })
//               .eq(0)
//               .click()
//           })
//           it('should set the assinged user to that user', () => {
//             cy.get('[data-test=add-assignee-popover]').should('not.exist')
//             cy.get('[data-test=task-cell-zero-assignee-chip]').should(
//               'not.exist'
//             )
//             cy.get('[data-test=task-cell-assignee-avatar]').should('exist')
//             cy.get('[data-test=task-cell-assignee-avatar]')
//               .eq(0)
//               .should('have.text', `${user1.firstname[0]}${user1.lastname[0]}`)
//           })
//         })
//       })
//     })
//   }
// )
