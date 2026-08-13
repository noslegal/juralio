// import HttpStatus from 'http-status-codes'
// import {
//   createUser,
//   DEFAULT_ORGANISATION_ID,
// } from '../../../../helpers/users/user_api_helper'
// import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
// import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
// import {
//   createMatter,
//   addTeamMember,
// } from '../../../../helpers/matterprojects/matter_api_helper'

// describe('export_matter.cy', () => {
//   const url = 'export/matter'
//   let matterAdmin, standardUser, userOfOtherMatter, fixture, otherMatter
//   before(() => {
//     createUser('other user', undefined, false)
//       .then(createdUser => {
//         standardUser = createdUser
//         sysadminAddUserToOrganisation(
//           { id: DEFAULT_ORGANISATION_ID },
//           standardUser
//         )
//         createUser().then(createdUser => {
//           matterAdmin = createdUser

//           const seed = {
//             matter: {
//               prefix: 'importantMatter',
//               teamMembers: [matterAdmin, standardUser],
//               matterAdmins: [matterAdmin],
//               projects: [
//                 {
//                   name: 'Project 1',
//                   tasks: [{ name: 'Happy' }],
//                 },
//                 {
//                   name: 'Project 2',
//                   tasks: [{ name: 'Halloween' }],
//                 },
//               ],
//             },
//           }
//           fixture = generateFixture(seed)
//         })
//       })
//       .then(() => {
//         createUser('user of other matter').then(createdUser => {
//           userOfOtherMatter = createdUser
//           createMatter('another matter').then(matter => {
//             otherMatter = matter
//             addTeamMember(otherMatter.id, userOfOtherMatter.id)
//           })
//         })
//       })
//   })

//   describe('when trying to export a matter', () => {
//     describe('when NOT signed in', () => {
//       before(() => {
//         cy.logoutServerSide()
//       })

//       it('should return UNAUTHORIZED status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}/${fixture.matter.id}`,
//           method: 'GET',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//         })
//       })
//     })

//     describe('when signed in as a MATTER TEAM MEMBER', () => {
//       before(() => {
//         cy.login(standardUser.username)
//       })

//       it('should return BAD REQUEST status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}/${fixture.matter.id}`,
//           method: 'GET',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
//         })
//       })
//     })

//     describe('when signed in as a MATTER ADMIN', () => {
//       before(() => {
//         cy.login(matterAdmin.username)
//       })

//       it('should return OK status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}/${fixture.matter.id}`,
//           method: 'GET',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.OK)
//         })
//       })
//     })

//     describe('when signed in as a MATTER ADMIN from another matter', () => {
//       before(() => {
//         cy.login(userOfOtherMatter.username)
//       })

//       it('should return BAD REQUEST status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}/${fixture.matter.id}`,
//           method: 'GET',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
//         })
//       })
//     })
//   })
// })
