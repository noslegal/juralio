export function createTemplate(name, projectId) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
      method: 'POST',
      body: {
        name: name,
        projectId: projectId,
      },
    })
    .its('body')
}

export function publishTemplate(templateId) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/admin/projecttemplates/${templateId}`,
      method: 'PATCH',
      body: {
        published: true,
      },
    })
    .its('body')
}

export function createBlankTemplate(name) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
      method: 'POST',
      body: {
        name: name,
      },
    })
    .its('body')
}

export function createTemplateTask(templateId, parentId, name) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks`,
      method: 'POST',
      body: {
        name: name,
        ...(parentId && { parentTaskId: parentId }),
      },
    })
    .its('body')
}

export function createSystemLevelTemplate(name, published = false) {
  cy.login('sysadmin@juralio.com', 'Password1Password1$')
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
      method: 'POST',
      body: {
        name: name,
        published: published,
      },
    })
    .its('body')
}

export function createTemplateTaskPost(templateId, templateTaskId, name) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`,
      method: 'POST',
      body: { name: name, privatePost: false },
    })
    .its('body')
}

export function createTemplateTaskNote(
  templateId,
  templateTaskId,
  name,
  description
) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`,
      method: 'POST',
      body: { name: name, privatePost: false, description: description },
    })
    .its('body')
}

export function createTemplateTaskLink(
  templateId,
  templateTaskId,
  name,
  description,
  url,
  type
) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`,
      method: 'POST',
      body: {
        name: name,
        privatePost: false,
        description: description,
        url: url,
        type: type,
      },
    })
    .its('body')
}

export function finaliseTemplatePost(templateId, templateTaskId, postId) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts/${postId}`,
      method: 'PATCH',
      body: {
        finalised: true,
      },
    })
    .its('body')
}

export function createTemplateResource(templateId, name, url) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/projecttemplates/${templateId}/resources`,
    method: 'POST',
    body: {
      name,
      url,
    },
    failOnStatusCode: false,
  })
}

export function getTemplateResources(templateId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/projecttemplates/${templateId}/resources`,
    method: 'GET',
    failOnStatusCode: false,
  })
}

export function getTemplateResource(templateId, resourceId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/projecttemplates/${templateId}/resources/${resourceId}`,
    method: 'GET',
    failOnStatusCode: false,
  })
}
export function updateTemplateResource(templateId, resourceId, payload) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/projecttemplates/${templateId}/resources/${resourceId}`,
    method: 'PATCH',
    body: payload,
    failOnStatusCode: false,
  })
}
export function deleteTemplateResource(templateId, resourceId) {
  return cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/projecttemplates/${templateId}/resources/${resourceId}`,
    method: 'DELETE',
    failOnStatusCode: false,
  })
}
