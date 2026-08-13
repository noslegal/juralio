export const enableSSO = () => {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/instance/settings`,
      method: 'PATCH',
      body: {
        microsoftSsoEnabled: true,
        oktaSsoEnabled: true,
        googleSsoEnabled: true,
      },
    })
  })
}
export const disableSSO = () => {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/instance/settings`,
      method: 'PATCH',
      body: {
        microsoftSsoEnabled: false,
        oktaSsoEnabled: false,
        googleSsoEnabled: false,
      },
    })
  })
}
export const enableCosts = () => {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/instance/settings`,
      method: 'PATCH',
      body: {
        costsEnabled: true,
      },
    })
  })
}

export const enableOrgCosts = orgId => {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/organisations/${orgId}`,
      method: 'PATCH',
      body: {
        costsEnabled: true,
        googleSsoEnabled: false,
        mfaEnabled: false,
        microsoftSsoEnabled: false,
        oktaSsoEnabled: false,
        samlSsoEnabled: false,
      },
    })
  })
}
