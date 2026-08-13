import HttpStatus from 'http-status-codes'

describe('post_user_notification_mark_all_read.cy', () => {
  const USER = {
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  const URL = 'usernotifications/read-all'

  describe('when trying to mark all user notifications as read', () => {
    describe('when NOT signed in as an authenticated user', () => {
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('when signed in as an authenticated user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
