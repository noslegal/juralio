import { getLegalTaskName } from '../data/legal_task_name_generator'

export function createTask(
  matterId,
  projectId,
  statusId,
  taskName,
  isMilestone = false,
  isDeliverable = false
) {
  const name = taskName || getLegalTaskName()

  let payload = {
    matterId,
    name,
    project: projectId,
    status: statusId,
    isMilestone: isMilestone,
    isDeliverable: isDeliverable,
  }

  payload = { ...payload }

  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/tasks`,
      method: 'POST',
      body: payload,
    })
    .its('body')
}

export function updateTask(matterId, projectId, taskId, payload) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: payload,
    })
    .its('body')
}

export const restorePost = (
  matterId,
  postId,
  newLocation,
  newLocationType = true
) => {
  return cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/matter/${matterId}/post/${postId}`,
    method: 'PATCH',
    body: {
      matterId: newLocation.matterId,
      projectId: newLocation.projectId,
      taskId: newLocation.taskId,
      type: newLocationType ? 'newLocation' : 'prevLocation',
    },
  })
}

export const archivePost = (matterId, projectId, taskId, postId) => {
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}`,
    method: 'PATCH',
    body: { archive: true },
  })
}

export function addNoteToTask(matterId, projectId, taskId, payload) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/posts`,
      method: 'POST',
      body: payload,
    })
    .its('body')
}

export function addNoteToTemplateTask(templateId, taskId, payload) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/projecttemplates/${templateId}/tasks/${taskId}/posts`,
      method: 'POST',
      body: payload,
    })
    .its('body')
}

export async function addTeamMembers(matterId, projectId, taskId, teamMembers) {
  return cy.wrap(teamMembers).each(teamMember => {
    teamMember.isPlaceholder = false
    return cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/teammembers`,
        method: 'POST',
        body: { user: teamMember },
      })
      .its('body')
  })
}

export async function addFollowers(matterId, projectId, taskId, followers) {
  return cy.wrap(followers).each(follower => {
    cy.login(follower.username)
    return cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}/followers`,
        method: 'POST',
      })
      .its('body')
  })
}

export function createSubTask(
  matterId,
  projectId,
  statusId,
  taskName,
  parentId,
  isMilestone = false,
  isDeliverable = false
) {
  const name = taskName || getLegalTaskName()

  let payload = {
    matterId,
    name,
    isMilestone: isMilestone,
    isDeliverable: isDeliverable,
    project: projectId,
    status: statusId,
    phase: parentId,
  }

  payload = { ...payload }

  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/tasks`,

      method: 'POST',
      body: payload,
    })
    .its('body')
}
