// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'
// describe('task_linking_api.cy', () => {
//   let user, unauthorizedUser, appPage, fixture

//   before(() => {
//     createUser().then(createdUser => {
//       createUser().then(u => (unauthorizedUser = u))
//       user = createdUser
//       const seed = {
//         matter: {
//           prefix: 'TaskLinking',
//           teamMembers: [user],
//           matterAdmins: [user],
//           projects: [
//             {
//               name: 'a',
//               tasks: [
//                 { name: 'a', properties: { status: 'done' } },
//                 { name: 'b' },
//                 { name: 'c' },
//                 { name: 'd' },
//               ],
//             },
//           ],
//         },
//       }
//       fixture = generateFixture(seed)
//       appPage = getWrapper(fixture)
//     })
//   })

//   describe('trying to edit linkage as an unauthorised user', () => {
//     before(() => {
//       cy.login(unauthorizedUser.username)
//     })
//     describe('linking single task', () => {
//       it('should be unauthorized', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/link`,
//           method: 'POST',
//           body: { linkedWithSiblings: true },
//         }).then(response => {
//           expect(response.status).to.eq(403)
//         })
//       })
//     })
//     describe('unlinking single task', () => {
//       before(() => {
//         cy.login(unauthorizedUser.username)
//       })
//       it('should be unauthorized', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/link`,
//           method: 'POST',
//           body: { linkedWithSiblings: false },
//         }).then(response => {
//           expect(response.status).to.eq(403)
//         })
//       })
//     })
//     describe('linking siblings task', () => {
//       before(() => {
//         cy.login(unauthorizedUser.username)
//       })
//       it('should be unauthorized', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/linkAllSiblings`,
//           method: 'POST',
//           body: { linkedWithSiblings: true },
//         }).then(response => {
//           expect(response.status).to.eq(403)
//         })
//       })
//     })
//     describe('unlinking siblings task', () => {
//       before(() => {
//         cy.login(unauthorizedUser.username)
//       })
//       it('should be unauthorized', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/linkAllSiblings`,
//           method: 'POST',
//           body: { linkedWithSiblings: false },
//         }).then(response => {
//           expect(response.status).to.eq(403)
//         })
//       })
//     })
//   })
//   describe('trying to edit linkage as an authorised user', () => {
//     before(() => {
//       cy.login(user.username)
//     })
//     describe('linking single task', () => {
//       it('should be OK', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/link`,
//           method: 'POST',
//           body: { linkedWithSiblings: true },
//         }).then(response => {
//           expect(response.status).to.eq(200)
//           expect(response.body.datesLinkedToSiblings).to.eq(true)
//         })
//       })
//     })
//     describe('unlinking single task', () => {
//       before(() => {
//         cy.login(user.username)
//       })
//       it('should be OK', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/link`,
//           method: 'POST',
//           body: { linkedWithSiblings: false },
//         }).then(response => {
//           expect(response.status).to.eq(200)
//           expect(response.body.datesLinkedToSiblings).to.eq(false)
//         })
//       })
//     })
//     describe('linking siblings task', () => {
//       before(() => {
//         cy.login(user.username)
//       })
//       it('should be OK', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/linkAllSiblings`,
//           method: 'POST',
//           body: { linkedWithSiblings: true },
//         }).then(response => {
//           expect(response.status).to.eq(200)
//           expect(response.body.datesLinkedToSiblings).to.eq(true)
//         })
//       })
//     })
//     describe('unlinking siblings task', () => {
//       before(() => {
//         cy.login(user.username)
//       })
//       it('should be OK', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/matter/${
//             fixture.matter.id
//           }/workstreams/${fixture.projects[0].id}/task/${
//             fixture.tasks[0].id
//           }/linkAllSiblings`,
//           method: 'POST',
//           body: { linkedWithSiblings: false },
//         }).then(response => {
//           expect(response.status).to.eq(200)
//           expect(response.body.datesLinkedToSiblings).to.eq(false)
//         })
//       })
//     })
//   })
// })
