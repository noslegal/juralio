export function getNotifications(user) {
  return cy.login(user.username).then(() => {
    return cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/usernotifications`,
        method: 'GET',
      })
      .then(resp => resp.body)
  })
}
