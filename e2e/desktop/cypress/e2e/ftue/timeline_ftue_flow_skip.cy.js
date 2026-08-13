// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import {
//     createUser,
//     updateFTUE
// } from '../../../../helpers/users/user_api_helper'

// describe('timeline_ftue_flow_skip.cy', () => {
//   let user, fixture
//   before(() => {
//     createUser().then(createdUser => {
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'directroute',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'P1',
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//     })
//   })

//   describe('when timeline is visited', () => {
//     before(() => {
//       cy.login(user.username)
//       updateFTUE(user, { hasSeenTimeline: false })
//       cy.login(user.username) // log in again to refresh status.
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/timeline/`
//       )
//     })

//     it('should display the timeline FTUE', () => {
//       cy.get('[data-test=timeline-ftue]').should('be.visible')
//     })

//     describe('on clicking the skip button', () => {
//       before(() => {
//         cy.login(user.username)
//         cy.get('body').type('{esc}')
//         cy.get('[data-test=ftueSkipButton]').click()
//       })

//       it('should no longer display the timeline FTUE', () => {
//         cy.get('[data-test=timeline-ftue]').should('not.exist')
//       })

//       describe('reloading the page', () => {
//         before(() => {
//           cy.login(user.username)
//           cy.reload()
//         })

//         it('should not display the timeline FTUE', () => {
//           cy.get('[data-test=timeline-ftue]').should('not.exist')
//         })
//       })
//     })
//   })
// })
