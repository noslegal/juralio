import { loginViaUI } from '../../../../../helpers/login/mfa_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('login_changepassword_validation.cy', () => {
  const Credentials = {
    NEW_PASSWORD: 'Password2Password2$Password2Password2$$',
  }
  const InputBox = {
    OLD_PASSWORD: 'old-password-input',
    NEW_PASSWORD: 'new-password-input',
    VERIFY_NEW_PASSWORD: 'verify-new-password-input',
  }
  let testUser

  describe('when login as a user who has just been created', () => {
    before(() => {
      createUser(undefined, false).then(user => {
        testUser = user
        loginViaUI(user.username, testUser.temporaryPassword.password)
      })
    })

    describe('he should go through the change password process', () => {
      describe('when user input incorrect old password and submit', () => {
        before(() => {
          typeIntoField(
            InputBox.OLD_PASSWORD,
            'AnewbutWrongPassword1Password1$2'
          )
          typeIntoField(InputBox.NEW_PASSWORD, 'Password2Password2$')
          typeIntoField(InputBox.VERIFY_NEW_PASSWORD, 'Password2Password2$')
          submit()
        })

        it('should display the validation message as "Current password incorrect"', () => {
          getValidationMessage().contains('Current password incorrect')
        })
      })

      describe('when the user input correct old password', () => {
        before(() => {
          typeIntoField(
            InputBox.OLD_PASSWORD,
            testUser.temporaryPassword.password
          )
        })

        describe('and the new passwords user input do not match', () => {
          describe('where both are not empty but not matching', () => {
            before(() => {
              typeIntoField(InputBox.NEW_PASSWORD, 'fail-validation')
              typeIntoField(InputBox.VERIFY_NEW_PASSWORD, 'fail-validation-1')
              submit()
            })

            it('should display the validation message as "Passwords do not match"', () => {
              getValidationMessage().contains('Passwords do not match')
            })
          })
        })

        describe('and password complexity not met', () => {
          describe('where contains only numbers', () => {
            before(() => {
              typeIntoField(InputBox.NEW_PASSWORD, '12345678')
              typeIntoField(InputBox.VERIFY_NEW_PASSWORD, '12345678')
              submit()
            })

            it('should display the validation message as "Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols."', () => {
              getValidationMessage().contains(
                'Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols.'
              )
            })
          })

          describe('where contains only lower case letters', () => {
            before(() => {
              typeIntoField(InputBox.NEW_PASSWORD, 'abcdefgh')
              typeIntoField(InputBox.VERIFY_NEW_PASSWORD, 'abcdefgh')
              submit()
            })

            it('should display the validation message as "Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols."', () => {
              getValidationMessage().contains(
                'Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols.'
              )
            })
          })

          describe('where contains only upper case letters', () => {
            before(() => {
              typeIntoField(InputBox.NEW_PASSWORD, 'ABCDEFGH')
              typeIntoField(InputBox.VERIFY_NEW_PASSWORD, 'ABCDEFGH')
              submit()
            })

            it('should display the validation message as "Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols."', () => {
              getValidationMessage().contains(
                'Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols.'
              )
            })
          })

          describe('where contains only symbols', () => {
            before(() => {
              typeIntoField(InputBox.NEW_PASSWORD, '!@£$%^&*')
              typeIntoField(InputBox.VERIFY_NEW_PASSWORD, '!@£$%^&*')
              submit()
            })

            it('should display the validation message as "Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols."', () => {
              getValidationMessage().contains(
                'Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols.'
              )
            })
          })
        })

        describe('and new password is same as the old one', () => {
          describe('where both new password inputs are empty', () => {
            before(() => {
              typeIntoField(
                InputBox.NEW_PASSWORD,
                testUser.temporaryPassword.password
              )
              typeIntoField(
                InputBox.VERIFY_NEW_PASSWORD,
                testUser.temporaryPassword.password
              )
              submit()
            })

            it('should display the validation message as "Cannot be same as current password"', () => {
              getValidationMessage().contains(
                'Cannot be same as current password'
              )
            })
          })
        })
      })
    })
  })
})

function getValidationMessage() {
  return cy.get('[data-test="validation-box"] [data-test="validation-message"]')
}

function typeIntoField(fieldTag, value) {
  if (value) {
    cy.get(`[data-test=${fieldTag}]`).find('input').clear().type(value)
  } else {
    cy.get(`[data-test=${fieldTag}]`).find('input').clear()
  }
}

function submit() {
  cy.get('[data-test=password-submit-button]').click()
}
