// import HttpStatus from 'http-status-codes'
// import createNotice from '../../../../helpers/noticeboard/notice_api_helper'

// describe('delete_notice.cy', () => {
//   const USER = {
//     STANDARD_USER: {
//       username: 'matter.creator@juralio.com',
//       password: 'Password2Password2$',
//     },
//   }

//   let url
//   let noticeId

//   describe('when trying to delete a notice', () => {
//     before(() => {
//       createNotice(
//         'delete_notice_spec title',
//         'delete_notice_spec subtitle'
//       )
//         .then(response => {
//           return response.json()
//         })
//         .then(data => {
//           noticeId = data.id
//           url = 'noticeboard/notice/' + noticeId
//           cy.logoutServerSide()
//         })
//     })

//     describe('when NOT signed in as an authenticated user', () => {
//       it('should return UNAUTHORIZED status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}`,
//           method: 'DELETE',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//         })
//       })
//     })

//     describe('when signed in as an authenticated user', () => {
//       before(() => {
//         cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//       })

//       it('should return FORBIDDEN status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}`,
//           method: 'DELETE',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.FORBIDDEN)
//         })
//       })

//       after(() => {
//         cy.logoutServerSide()
//       })
//     })

//     describe('when signed in as a sys admin', () => {
//       before(() => {
//         cy.login('sysadmin@juralio.com', 'Password1Password1$')
//       })

//       it('should return OK status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}`,
//           method: 'DELETE',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.OK)
//         })
//       })

//       after(() => {
//         cy.logoutServerSide()
//       })
//     })
//   })
// })
