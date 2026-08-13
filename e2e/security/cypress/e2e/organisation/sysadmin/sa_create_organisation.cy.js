import HttpStatus from 'http-status-codes'

describe('sa_create_organisation.cy', () => {
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

  const URL = 'organisations'

  describe('when trying to create an organisation', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {
            name: `myTotallyUniqueOrg${new Date().getTime()}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to create an organisation', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {
            name: `myTotallyUniqueOrg${new Date().getTime()}`,
            mfaEnabled: false,
          },
        }).then((response) => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
  })
})
