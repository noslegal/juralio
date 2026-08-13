import { Decoder } from '@nuintun/qrcode'

const qrcode = new Decoder()
const OTPAuth = require('otpauth')

const padPasscode = passcode => passcode.padStart(6, '0')

export const generateValidInvalidPasscodePairFromQRCode = resolve => {
  return cy.get('[data-test=mfa-register-qr] canvas').then(canvas => {
    const dataURL = canvas.get(0).toDataURL()
    return qrcode.scan(dataURL).then(decoded => {
      const totp = OTPAuth.URI.parse(decoded.data)
      const generatedPasscode = padPasscode(totp.generate())
      const invalidPasscode = padPasscode(
        `${Number.parseInt(generatedPasscode) ^ 739123}`
      )

      return [generatedPasscode, invalidPasscode]
    })
  })
}

export const loginViaUI = (username, password) => {
  cy.clearUserSession()
  cy.wait(2000)
  cy.visit('/#/login')
  cy.wait(2000)
  cy.get('[data-test="username-input"]', { timeout: 10000 })
    .find('input')
    .type(username)
  cy.get('[data-test="password-input"]')
    .find('input')
    .type(password ? password : Cypress.env('defaultPassword'))
    .type('{enter}')
}

export const enterPasscode = passcode => {
  for (let i = 0; i < 6; ++i) {
    cy.get(`[data-test=${i}-digit-input]`).type(passcode[i])
  }
}
