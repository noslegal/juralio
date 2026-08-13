// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../helpers/users/user_api_helper'

// describe('task_browser_level_letters_display.cy', () => {
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
//                   tasks: [
//                     { name: 'B1', tasks: [{ name: 'C1' }, { name: 'C2' }] },
//                     { name: 'B2' },
//                     { name: 'B3' },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//     })
//   })

//   describe('when viewing the timeline for a level C task with no siblings', () => {
//     before(() => {
//       cy.login(user.username)
//       cy.visit(
//         `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasksMappedByName['C1'].id}/timeline`
//       )
//     })

//     it('should display only 1 level letter in the header', () => {
//       cy.get('[data-test=level-letter]').should('have.length', 1)
//     })

//     it('should display C as the level letter', () => {
//       cy.get('[data-test=level-letter]').eq(0).should('have.text', 'C')
//     })

//     describe('when navigating to its level B parent (has siblings)', () => {
//       before(() => {
//         cy.get('[data-test=navigate-to-parent]').click({ force: true })
//       })

//       it('should display 2 level letters in the header', () => {
//         cy.get('[data-test=level-letter]').should('have.length', 2)
//       })

//       it('should display B as the first level letter', () => {
//         cy.get('[data-test=level-letter]').eq(0).should('have.text', 'B')
//       })

//       it('should display C as the second level letter', () => {
//         cy.get('[data-test=level-letter]').eq(1).should('have.text', 'C')
//       })

//       describe('when navigating to its level A parent (has siblings)', () => {
//         before(() => {
//           cy.get('[data-test=navigate-to-parent]').click({ force: true })
//         })

//         it('should display 2 level letters in the header', () => {
//           cy.get('[data-test=level-letter]').should('have.length', 2)
//         })

//         it('should display A as the first level letter', () => {
//           cy.get('[data-test=level-letter]').eq(0).should('have.text', 'A')
//         })

//         it('should display B as the second level letter', () => {
//           cy.get('[data-test=level-letter]').eq(1).should('have.text', 'B')
//         })

//         describe('when navigating to its project parent', () => {
//           before(() => {
//             cy.get('[data-test=navigate-to-parent]').click({ force: true })
//           })

//           it('should display 2 level letters in the header', () => {
//             cy.get('[data-test=level-letter]').should('have.length', 2)
//           })

//           it('should display blank as the first letter', () => {
//             cy.get('[data-test=level-letter]').eq(0).should('have.text', '')
//           })

//           it('should display A as the second letter', () => {
//             cy.get('[data-test=level-letter]').eq(1).should('have.text', 'A')
//           })
//         })
//       })
//     })
//   })
// })
