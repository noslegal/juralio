// import HttpStatus from 'http-status-codes'

// describe('get_universal_search.cy', () => {
//   const USER = {
//     STANDARD_USER: {
//       username: 'matter.creator@juralio.com',
//       password: 'Password2Password2$',
//     },
//     SYSADMIN_USER: {
//       username: 'sysadmin@juralio.com',
//       password: 'Password1Password1$',
//     },
//   }

//   const URL = 'universal/search'

//   describe('when trying to perform a universal search when NOT logged in', () => {
//     it('should return UNAUTHORIZED status', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'GET',
//       }).then(response => {
//         expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
//       })
//     })
//   })

//   describe('when trying to perform a universal search as SysAdmin', () => {
//     before(() => {
//       cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
//     })
//     it('should return OK status and an empty response', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'GET',
//       }).then(response => {
//         expect(response.body.length).to.eq(0)
//         expect(response.status).to.eq(HttpStatus.OK)
//       })
//     })
//   })

//   describe('when trying to perform a universal search as an authenticated user', () => {
//     beforeEach(() => {
//       cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
//     })
//     it('should return OK status for GET', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'GET',
//       }).then(response => {
//         expect(response.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('should return METHOD_NOT_ALLOWED status for POST', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'POST',
//       }).then(response => {
//         expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
//       })
//     })
//     it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'PATCH',
//       }).then(response => {
//         expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
//       })
//     })
//     it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
//       cy.apiSpecRequest({
//         url: `${Cypress.env('serverBaseUrl')}/${URL}`,
//         method: 'DELETE',
//       }).then(response => {
//         expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
//       })
//     })
//   })
// })
