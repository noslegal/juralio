export function addBlocker(blockerId, blockedId, projectId, matterId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${blockerId}/block`,
    method: 'POST',
    body: {
      taskId: blockedId,
      blocks: true,
    },
    failOnStatusCode: false,
  })
}

export function addBlocked(blockedId, blockerId, projectId, matterId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${blockedId}/block`,
    method: 'POST',
    body: {
      taskId: blockerId,
      blockedBy: true,
    },
    failOnStatusCode: false,
  })
}

export function getBlockers(taskId, projectId, matterId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/block`,
    method: 'GET',
    failOnStatusCode: false,
  })
}

export function deleteBlocker(taskId, task2Id, projectId, matterId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/block/${task2Id}`,
    method: 'DELETE',
    failOnStatusCode: false,
  })
}
