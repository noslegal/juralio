export function createOrganisationLabel(
  orgAdmin,
  name,
  type,
  optionalParameters = {}
) {
  return cy.login(orgAdmin.username).then(() => {
    return cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: name,
          type: type,
          ...optionalParameters,
        },
      })
      .then(resp => resp.body)
  })
}

export function createMatterLabel(
  matterAdmin,
  matterId,
  name,
  type,
  optionalParameters = {}
) {
  return cy.login(matterAdmin.username).then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/matter/${matterId}/labels`,
      method: 'POST',
      body: {
        name: name,
        type: type,
        ...optionalParameters,
      },
    })
  })
}

export function addLabelToTask(
  orgAdmin,
  matterId,
  projectId,
  taskId,
  labelId,
  modifier = 'amber'
) {
  return cy.login(orgAdmin.username).then(() => {
    return cy.request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/labels`,
      method: 'POST',
      body: {
        labelId: labelId,
        modifier: modifier,
      },
    })
  })
}
