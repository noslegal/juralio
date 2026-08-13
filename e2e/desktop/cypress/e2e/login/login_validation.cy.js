describe('login_validation.cy', () => {
  describe('when attempting to login', () => {
    before(() => {
      cy.clearUserSession()
      cy.visit('/#/login')
    })

    it('a login button with the text SIGN IN is displayed at the bottom of the login form', () => {
      getSubmitButton().should('have.text', 'Sign In')
    })

    describe('when the user hits the ENTER key', () => {
      describe('without username and password', () => {
        before(() => {
          cy.reload()
          typeIntoField('username', '{enter}')
        })
        it('should render a validation message as "Username and Password required"', () => {
          getValidationMessage().contains('Username and Password required')
        })
      })
    })

    describe('when a user clicks the login button', () => {
      describe('without username', () => {
        before(() => {
          cy.reload()
          typeIntoField('password', 'testing123')
          getSubmitButton().click()
        })

        it('should render a validation message as "Username is required"', () => {
          getValidationMessage().contains('Username is required')
        })
      })

      describe('without password', () => {
        before(() => {
          cy.reload()
          typeIntoField('username', 'testing123@juralio.com')
          getSubmitButton().click()
        })

        it(
          'should render a validation message as "Password is required"',
          { retries: { runMode: 2, openMode: 1 } },
          () => {
            getValidationMessage().contains('Password is required')
          }
        )
      })

      describe('without username and password', () => {
        before(() => {
          cy.reload()
          getSubmitButton().click()
        })

        it('should render a validation message as "Username and Password required"', () => {
          getValidationMessage().contains('Username and Password required')
        })
      })
    })

    describe('When a failed login attempt has been made and the user has made some updates', () => {
      describe('the password field', () => {
        before(() => {
          cy.reload()
          typeIntoField('username', 'testing123@juralio.com')
          getSubmitButton().click()
          getValidationMessage().should('be.visible')
          typeIntoField('password', 'testing123')
        })

        it(
          'and the validation box is not shown',
          { retries: { runMode: 2, openMode: 1 } },
          () => {
            getValidationMessage().should('not.exist')
          }
        )
      })

      describe('the username field', () => {
        before(() => {
          cy.reload()
          typeIntoField('password', 'testing123')
          getSubmitButton().click()
          getValidationMessage().should('be.visible')
          typeIntoField('username', 'testing123@juralio.com')
        })

        it(
          'and the validation box is not shown',
          { retries: { runMode: 2, openMode: 1 } },
          () => {
            getValidationMessage().should('not.exist')
          }
        )
      })

      describe('username and password fields', () => {
        before(() => {
          cy.reload()
          getSubmitButton().click()
          getValidationMessage().should('be.visible')
          typeIntoField('username', 'testing123@juralio.com')
        })

        it(
          'and the validation box is not shown',
          { retries: { runMode: 2, openMode: 1 } },
          () => {
            getValidationMessage().should('not.exist')
          }
        )
      })
    })
  })
})

function getValidationMessage() {
  return cy.get('[data-test="validation-box"]')
}

function typeIntoField(field, value) {
  cy.get(`[data-test="${field}-input"] input`).type(value)
}

function getSubmitButton() {
  return cy.get('[data-test=password-submit-button]')
}
