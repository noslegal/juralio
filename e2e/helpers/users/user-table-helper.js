export const assertNumberOfUserRowsCorrect = expectedNumberOfUsers =>
  cy
    .get('[data-test=user-list-item]')
    .should('have.length', expectedNumberOfUsers)

export const assertUserCountTitleCorrect = expectedTitle =>
  cy.get('[data-test=user-count-summary]').should('contain.text', expectedTitle)

export const assertTableHeadersCorrect = (checkForOrgColumn = true) => {
  cy.get('[data-test=user-name-header]').should('be.visible')
  cy.get('[data-test=user-name-header]').should('have.text', 'Name')
  cy.get('[data-test=user-roles-header]').should('have.text', 'Roles')
  if (checkForOrgColumn) {
    cy.get('[data-test=user-org-header]').should('have.text', 'Organisation')
  }
  cy.get('[data-test=user-status-header]').should('have.text', 'Status')
}

export const constructAvatarText = user =>
  `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()

export const constructAvatarTextFromName = (firstName, lastName) =>
  `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`.toUpperCase()

export const getUserRowByUsername = username => {
  cy.get('[data-test=search-button]', { timeout: 30000 }).click()
  cy.get('[data-test=Search]')
    .clear()
    .type(username.substring(0, 10), { delay: 5 })
  return cy.get('[data-test=user-list-item]')
}

export const getUserRowByIndex = index =>
  cy.get('[data-test=user-list-item]').eq(index)

export const launchDialogByUsername = username => {
  getUserRowByUsername(username).click(0, 0)
  cy.get('[data-test=update-user-dialog]').should('be.visible')
}

export const assertNoOrganisation = email => {
  getUserRowByUsername(email).then(row => {
    cy.wrap(row).scrollIntoView()
    //Organisation
    cy.wrap(row)
      .find('[data-test=user-org-text]')
      .should('contain.text', 'None')
  })
}

export const assertOrganisationName = (email, orgName) => {
  getUserRowByUsername(email).then(row => {
    cy.wrap(row).scrollIntoView()
    cy.wrap(row)
      .find('[data-test=user-org-text]')
      .should('contain.text', orgName)
  })
}

export const assertRowContentsCorrect = expectedContent => {
  getUserRowByUsername(expectedContent.email).then(row => {
    cy.wrap(row).scrollIntoView()
    //Avatar
    cy.wrap(row).find('[data-test=user-avatar]').should('be.visible')
    //Name
    cy.wrap(row)
      .find('[data-test=user-name-text]')
      .should('contain.text', expectedContent.name)
    //Roles
    cy.wrap(row)
      .find('[data-test=user-roles]')
      .should('contains.text', expectedContent.roles)

    // MFA
    if (expectedContent.mfa) {
      cy.wrap(row)
        .find('[data-test=user-mfa]')
        .find(
          `[data-test=lock-switch-${
            expectedContent.mfaEnabled ? 'closed' : 'open'
          }]`
        )
        .should('be.visible')
    }
    //Status
    cy.wrap(row)
      .find('[data-test=user-status]')
      .should('contains.text', expectedContent.status)
    if (expectedContent.statusEnabled !== undefined) {
      cy.wrap(row)
        .find('[data-test=user-status-toggle-wrapper]')
        .find('div')
        .should(
          expectedContent.statusEnabled ? 'not.have.attr' : 'have.attr',
          'disabled'
        )
    }
    //Last Login Date
    if (expectedContent.lastLoginDate) {
      cy.wrap(row)
        .find('[data-test=user-last-log-in]')
        .should('contain.text', expectedContent.lastLoginDate)
    }
  })
}