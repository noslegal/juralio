// //single workstream matter
// //multi workstream matter
// //check chip rendered

// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
// import { createUser } from '../../../../helpers/users/user_api_helper'

// const visitHelpers = new VisitHelpers()
// //check tooltip correct & ordered
// describe('matter_overview_milestone_chips_display.cy', () => {
//   let user, swmFixture, mwmFixture
//   before(() => {
//     createUser().then(u => {
//       user = u
//       const swmSeed = {
//         matter: {
//           prefix: '',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'P1',
//               tasks: [
//                 {
//                   name: 'Task 1',
//                   tasks: [
//                     { name: 'M1', isMilestone: true },
//                     { name: 'M2', isMilestone: true },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       const mwmSeed = {
//         matter: {
//           prefix: '',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'P1',
//               tasks: [
//                 {
//                   name: 'Task 1',
//                   tasks: [
//                     { name: 'M1', isMilestone: true },
//                     { name: 'M2', isMilestone: true },
//                   ],
//                 },
//               ],
//             },
//             {
//               name: 'P2',
//               tasks: [{ name: 'Task 1' }],
//             },
//           ],
//         },
//       }
//       swmFixture = generateFixture(swmSeed)
//       mwmFixture = generateFixture(mwmSeed)
//     })
//   })
//   describe('when viewing a single workstream matter overview', () => {
//     before(() => {
//       cy.login(user)
//       visitHelpers.visitTaskDetails(
//         swmFixture.matter.id,
//         swmFixture.projects[0].id,
//         swmFixture.tasks[1].id
//       )
//       cy.get('[data-test=task-card-option-menu-button]').click()
//       cy.get('[data-test=task-card-option-menu]').eq(2).click()
//       //assign self

//       cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
//       cy.wait(1000)
//       cy.get('[data-test=add-team-member-button]').click()
//       cy.get('[data-test=autocomplete-search]')
//         .find('input')
//         .type(`${user.firstname}{enter}`)
//       cy.wait(1000)
//       visitHelpers.visitTaskDetails(
//         swmFixture.matter.id,
//         swmFixture.projects[0].id,
//         swmFixture.tasks[2].id
//       )
//       cy.get('[data-test=task-card-option-menu-button]').click()
//       cy.get('[data-test=task-card-option-menu]').eq(2).click()
//       // cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
//       visitHelpers.visitMatterOverview(swmFixture.matter.id)
//       cy.wait(2000)
//     })
//     it('should render the milestone chips', () => {
//       cy.get('[data-test=milestone-icon]', { timeout: 30000 }).should(
//         'have.length',
//         1
//       )
//       cy.get('[data-test=milestone-overlap-count]').should('have.length', 1)
//       cy.get('[data-test=milestone-overlap-count]').should('have.text', 2)
//     })
//     describe('when hovering over the chip', () => {
//       before(() => {
//         cy.get('[data-test=milestone-icon]').trigger('mouseover')
//         cy.wait(1000)
//       })
//       it('should show the popover', () => {
//         cy.get('[data-test=milestone-name]').should('have.length', 2)
//         // cy.get('[data-test=milestone-name]').eq(0).should('have.text', 'M1')
//         // cy.get('[data-test=milestone-name]').eq(1).should('have.text', 'M2')
//         cy.get('[data-test=milestone-date]')
//           .eq(1)
//           .should('contain.text', 'Milestone reached on:')
//         cy.get('[data-test=milestone-date]')
//           .eq(1)
//           .should('contain.text', 'Milestone reached on:')
//       })
//       describe('when viewing a multi workstream matter overview', () => {
//         before(() => {
//           cy.login(user)
//           visitHelpers.visitTaskDetails(
//             mwmFixture.matter.id,
//             mwmFixture.projects[1].id,
//             mwmFixture.tasks[4].id
//           )

//           cy.get('[data-test=task-card-option-menu-button]').click()
//           cy.get('[data-test=task-card-option-menu]').eq(2).click()

//           cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
//           cy.wait(1000)
//           //assign self
//           cy.get('[data-test=add-team-member-button]').click()
//           cy.get('[data-test=autocomplete-search]')
//             .find('input')
//             .type(`${user.firstname}{enter}`)
//           cy.wait(1000)
//           visitHelpers.visitTaskDetails(
//             mwmFixture.matter.id,
//             mwmFixture.projects[1].id,
//             mwmFixture.tasks[5].id
//           )
//           cy.get('[data-test=task-card-option-menu-button]').click()
//           cy.get('[data-test=task-card-option-menu]').eq(2).click()
//           // cy.get('[data-test=action-dialog-button]').click()
//           cy.wait(1000)
//           // visitHelpers.visitTaskDetails(
//           //   mwmFixture.matter.id,
//           //   mwmFixture.projects[1].id,
//           //   mwmFixture.tasks[5].id
//           // )
//           // cy.get('[data-test=task-card-option-menu-button]').click()
//           // cy.get('[data-test=task-card-option-menu]').eq(2).click()
//           // cy.get('[data-test=action-dialog-button]').click()
//           // cy.wait(1000)
//           visitHelpers.visitMatterOverview(swmFixture.matter.id)
//         })
//         it('should render the milestone chips', () => {
//           cy.get('[data-test=milestone-icon]').should('have.length', 1)
//           cy.get('[data-test=milestone-overlap-count]').should('have.length', 1)
//           cy.get('[data-test=milestone-overlap-count]').should('have.text', 2)
//         })
//         describe('when hovering over the chip', () => {
//           before(() => {
//             cy.get('[data-test=milestone-icon]').eq(0).trigger('mouseover')
//           })
//           it('should show the popover', () => {
//             cy.get('[data-test=milestone-name]').should('have.length', 2)
//             // cy.get('[data-test=milestone-name]').eq(0).should('have.text', 'M2')
//             // cy.get('[data-test=milestone-name]').eq(1).should('have.text', 'M1')
//             cy.get('[data-test=milestone-date]')
//               .eq(0)
//               .should('contain.text', 'Milestone reached')
//             cy.get('[data-test=milestone-date]')
//               .eq(1)
//               .should('contain.text', 'Milestone reached')
//           })
//           describe('when visiting a workstream overview', () => {
//             before(() => {
//               cy.login(user)
//               visitHelpers.visitProjectOverview(
//                 mwmFixture.matter.id,
//                 mwmFixture.projects[1].id
//               )
//             })
//             it('should render the milestone chips', () => {
//               cy.get('[data-test=milestone-icon]').should('have.length', 1)
//               cy.get('[data-test=milestone-overlap-count]').should(
//                 'have.length',
//                 1
//               )
//               cy.get('[data-test=milestone-overlap-count]').should(
//                 'have.text',
//                 2
//               )
//             })
//             describe('when hovering over the chip', () => {
//               before(() => {
//                 cy.get('[data-test=milestone-icon]').trigger('mouseover')
//               })
//               it('should show the popover', () => {
//                 cy.get('[data-test=milestone-name]').should('have.length', 2)
//                 cy.get('[data-test=milestone-name]')
//                 //   .eq(0)
//                 //   .should('have.text', 'M1')
//                 // cy.get('[data-test=milestone-name]')
//                 //   .eq(1)
//                 //   .should('have.text', 'M2')
//                 cy.get('[data-test=milestone-date]')
//                   .eq(0)
//                   .should('contain.text', 'Milestone reached')
//                 cy.get('[data-test=milestone-date]')
//                   .eq(1)
//                   .should('contain.text', 'Milestone reached')
//               })
//             })
//           })
//         })
//       })
//     })
//   })
// })
