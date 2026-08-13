import nameGenerator from 'project-name-generator'

export function createAction(
  matterId,
  projectId,
  taskId,
  actionName,
  properties
) {
  const description = actionName || nameGenerator.generate().spaced

  let payload = {
    taskId,
    description,
    completed: false,
  }

  payload = Object.assign({}, payload, properties)

  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/action`,
      method: 'POST',
      body: payload,
    })
    .its('body')
}
