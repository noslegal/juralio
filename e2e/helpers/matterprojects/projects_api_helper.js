import * as R from 'ramda'
import { getLegalProjectName } from '../data/legal_task_name_generator'

let projects = []
const sortByName = R.sortBy(R.prop('name'))

const updateProjects = project => {
  projects = [
    ...projects,
    { id: project.id, name: project.name, active: project.active },
  ]
}

export function openProject(matterId, projectId) {
  cy.request({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${projectId}`,
    method: 'GET',
  })
}

export const createWorkstream = (matterId, projectName, additionalProperties) =>
  createProject(matterId, projectName, additionalProperties)

export const createProject = (matterId, projectName, additionalProperties) => {
  const name = projectName || getLegalProjectName()

  let payload = {
    matterId: matterId,
    name,
  }

  payload = { ...payload, ...additionalProperties }

  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/matter/${matterId}/workstreams`,
      method: 'POST',
      body: payload,
    })
    .its('body')
}

export const updateProject = (matterId, project, properties) => {
  //Prevents issuing an update if no payload has been given
  if (properties && Object.entries(properties).length > 0) {
    return cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/admin/matter/${matterId}/workstreams/${project.id}`,
        method: 'PATCH',
        body: properties,
      })
      .its('body')
  } else {
    return Promise.resolve(project)
  }
}

export const createMultipleProjects = matterId => {
  return number => {
    for (let i = 0; i < number; i++) {
      createProject(matterId).then(updateProjects)
    }
  }
}

export const getProjects = idx =>
  idx !== undefined ? sortByName(projects)[idx] : sortByName(projects)

export const addPrivateMembers = (matterId, projectId, users) => {
  let url = `${Cypress.env(
    'serverBaseUrl'
  )}/matter/${matterId}/workstreams/${projectId}/teammembers`
  cy.wrap(users).each(user => {
    cy.apiSpecRequest({
      url,
      method: 'POST',
      body: {
        users: [user.id],
      },
    })
  })
}
