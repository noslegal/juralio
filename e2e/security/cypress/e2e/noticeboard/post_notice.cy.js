// import HttpStatus from 'http-status-codes'
// import createNotice from '../../../../helpers/noticeboard/notice_api_helper'

// describe('post_notice.cy', () => {
//   const USER = {
//     STANDARD_USER: {
//       username: 'matter.creator@juralio.com',
//       password: 'Password2Password2$',
//     },
//   }

//   let url

//   describe('when trying to create a notice', () => {
//     let formData
//     before(() => {
//       url = 'noticeboard/notice'

//       const fileName = 'image.svg'
//       cy.readFile(`cypress/fixtures/${fileName}`).then(str => {
//         let file = new File([str], fileName, { type: 'image/svg+xml' })
//         let form = new FormData()
//         form.append('title', 'post_notice_spec title')
//         form.append('subtitle', 'post_notice_spec subtitle')
//         form.append('file', file)
//         formData = form
//       })
//     })

//     describe('when NOT signed in as an authenticated user', () => {
//       before(() => {
//         cy.logoutServerSide()
//       })

//       it('should return UNAUTHORIZED status', () => {
//         cy.form_request(
//           `${Cypress.env('serverBaseUrl')}/${url}`,
//           formData
//         ).then(response => {
//           expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//         })
//       })
//     })

//     describe('when signed in as a standard user', () => {
//       before(() => {
//         cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//       })

//       it('should return FORBIDDEN status', () => {
//         cy.form_request(
//           `${Cypress.env('serverBaseUrl')}/${url}`,
//           formData
//         ).then(response => {
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
//         cy.form_request(
//           `${Cypress.env('serverBaseUrl')}/${url}`,
//           formData
//         ).then(response => {
//           expect(response.status).to.eq(HttpStatus.OK)
//         })
//       })

//       after(() => {
//         cy.logoutServerSide()
//       })
//     })
//   })

//   describe('when trying to feature a notice', () => {
//     let noticeId
//     before(() => {
//       createNotice('post_notice_spec title', 'post_notice_spec subtitle')
//     })

//     it('when have a valid notice id', () => {
//       cy.login('sysadmin@juralio.com', 'Password1Password1$')
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/noticeboard/notice`,
//         method: 'GET',
//       }).then(response => {
//         noticeId = response.body
//         url = 'noticeboard/notice/' + noticeId + '/feature'
//       })
//       cy.logoutServerSide()
//     })

//     describe('when NOT signed in as an authenticated user', () => {
//       before(() => {
//         cy.logoutServerSide()
//       })

//       it('should return UNAUTHORIZED status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}`,
//           method: 'POST',
//         }).then(response => {
//           expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//         })
//       })
//     })

//     describe('when signed in as a standard user', () => {
//       before(() => {
//         cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//       })

//       it('should return FORBIDDEN status', () => {
//         cy.apiSpecRequest({
//           url: `${Cypress.env('serverBaseUrl')}/${url}`,
//           method: 'POST',
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
//           method: 'POST',
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
