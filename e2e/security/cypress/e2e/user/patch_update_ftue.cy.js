import HttpStatus from 'http-status-codes'

describe('patch_update_ftue.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  describe('when trying to update ftue', () => {
    describe('when not signed in ', () => {
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/settings/user/updateftue`,
          method: 'PATCH',
          body: {
            hasSeenInbox: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })

  describe('when trying to update ftue', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/settings/user/updateftue`,
          method: 'PATCH',
          body: {
            hasSeenInbox: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
