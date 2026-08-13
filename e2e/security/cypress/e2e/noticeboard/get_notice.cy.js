// import HttpStatus from 'http-status-codes'
// import createNotice from '../../../../helpers/noticeboard/notice_api_helper'

// describe('get_notice.cy', () => {
//   const USER = {
//     STANDARD_USER: {
//       username: 'matter.creator@juralio.com',
//       password: 'Password2Password2$',
//     },
//   }

//   let url
//   let noticeId

//   describe('when trying to get a notice', () => {
//     before(() => {
//       createNotice('get_notice_spec title', 'get_notice_spec subtitle')
//     })

//     describe('when trying to get a notice id', () => {
//       before(() => {
//         url = 'noticeboard/notice'
//       })

//       describe('when NOT signed in as an authenticated user', () => {
//         before(() => {
//           cy.logoutServerSide()
//         })

//         it('should return UNAUTHORIZED status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//           })
//         })
//       })

//       describe('when signed in as an authenticated user', () => {
//         before(() => {
//           cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//         })

//         it('should return OK status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             noticeId = response.body

//             expect(response.status).to.eq(HttpStatus.OK)
//           })
//         })

//         after(() => {
//           cy.logoutServerSide()
//         })
//       })
//     })

//     describe('when trying to get a notice by id', () => {
//       before(() => {
//         url = 'noticeboard/notice/' + noticeId
//       })

//       describe('when NOT signed in as an authenticated user', () => {
//         it('should return UNAUTHORIZED status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//           })
//         })
//       })

//       describe('when signed in as an authenticated user', () => {
//         before(() => {
//           cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//         })

//         it('should return OK status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.OK)
//           })
//         })

//         after(() => {
//           cy.logoutServerSide()
//         })
//       })
//     })

//     describe('when trying to get meta data of a notice by id', () => {
//       before(() => {
//         url = 'noticeboard/notice/' + noticeId + '/meta'
//       })

//       describe('when NOT signed in as an authenticated user', () => {
//         it('should return UNAUTHORIZED status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//           })
//         })
//       })

//       describe('when signed in as an authenticated user', () => {
//         before(() => {
//           cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//         })

//         it('should return OK status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.OK)
//           })
//         })

//         after(() => {
//           cy.logoutServerSide()
//         })
//       })
//     })

//     describe('when trying to get meta data of all notices', () => {
//       before(() => {
//         url = 'noticeboard/meta'
//       })

//       describe('when NOT signed in as an authenticated user', () => {
//         it('should return UNAUTHORIZED status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//           })
//         })
//       })

//       describe('when signed in as an authenticated user', () => {
//         before(() => {
//           cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//         })

//         it('should return FORBIDDEN status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.FORBIDDEN)
//           })
//         })

//         after(() => {
//           cy.logoutServerSide()
//         })
//       })

//       describe('when signed in as a sys admin', () => {
//         before(() => {
//           cy.login('sysadmin@juralio.com', 'Password1Password1$')
//         })

//         it('should return OK status', () => {
//           cy.apiSpecRequest({
//             url: `${Cypress.env('serverBaseUrl')}/${url}`,
//             method: 'GET',
//           }).then(response => {
//             expect(response.status).to.eq(HttpStatus.OK)
//           })
//         })

//         after(() => {
//           cy.logoutServerSide()
//         })
//       })
//     })
//   })
// })
