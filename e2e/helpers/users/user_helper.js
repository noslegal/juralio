import { getUserRowByUsername } from './user-table-helper'

export const changeUserActiveStatus = (
  user,
  option = 'off',
  confirm = true
) => {
  cy.wait(1000)
  getUserRowByUsername(user.username)
  if (confirm) {
    cy.backendRoute('PATCH', '/users/*').as('patchUser')
  }
  cy.get('[data-test=status-select-selection-dropdown]', { timeout: 30000 })
    .eq(0)
    .click()
  cy.get(`[data-test=status-select-${option}-option]`).click()
  if (confirm) {
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@patchUser')
  }
}

export const createUser = (firstName, lastName, commit) => {
  cy.get('[data-test=fab-button]').click()
  cy.get('[data-test=create-user-flow-dialog-button]').click()

  if (commit) {
    cy.get('[data-test=first-name]').type(firstName)
    cy.get('[data-test=last-name]').type(lastName)
  }
}

export const checkAdminsAndUsersCountInTable = params => {
  it(`should have ${params.expectedAdminCount} admins`, () => {
    getOrgRowByOrgName(params.org).within(() =>
      cy
        .get('[data-test=number-of-orgadmins]')
        .should('have.text', params.expectedAdminCount.toString())
    )
  })
  it(`should have ${params.expectedUserCount} member users`, () => {
    getOrgRowByOrgName(params.org).within(() =>
      cy
        .get('[data-test=number-of-members]')
        .should('have.text', params.expectedUserCount.toString())
    )
  })
}

export const avatarInitials = userEmail => {
  const split = userEmail.split('@')[0].split('.')

  if (split.length > 1) {
    return `${split[0][0].toLocaleUpperCase()}${split[1][0].toLocaleUpperCase()}`
  }
  return split[0].substring(0, 2).toLocaleUpperCase()
}
