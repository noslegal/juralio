import nameGenerator from 'project-name-generator'

export function createTask(matterId, projectId, projectStatusId, taskName) {
  const name = taskName || nameGenerator.generate().spaced

  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/tasks`,
      method: 'POST',
      body: {
        matterId: matterId,
        project: projectId,
        status: projectStatusId,
        name: name,
      },
    })
    .its('body')
}

export function removeTeamMember(matterId, projectId, taskId, userId) {
  cy.login('matter.creator@juralio.com', 'Password2Password2$').then(() =>
    cy.request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/teammembers/${userId}`,
      method: 'DELETE',
    })
  )
}

export function addTeamMember(matterId, projectId, taskId, userId) {
  cy.login('matter.creator@juralio.com', 'Password2Password2$').then(() =>
    cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/teammembers`,
        method: 'POST',
        body: {
          userId: userId,
        },
      })
      .its('body')
  )
}

export function updateStatus(matterId, projectId, taskId, status) {
  cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}`,
    method: 'PATCH',
    body: {
      matterId: matterId,
      parentProject: projectId,
      status: status,
    },
  })
}

export function createTaskPerStatus(matterId, projectId, projectStatuses) {
  projectStatuses.forEach(status => {
    createTask(matterId, projectId, status.id, nameGenerator.generate().spaced)
  })
}
