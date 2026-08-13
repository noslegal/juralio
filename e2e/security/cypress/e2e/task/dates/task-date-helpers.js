import faker from 'faker'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

function generateTaskStructure(taskStructure) {
  let tasks = []
  for (let i = 0; i < taskStructure.length; i++) {
    tasks.push({
      name: faker.random.word(),
      tasks:
        taskStructure[i].length > 0
          ? generateTaskStructure(taskStructure[i])
          : [],
    })
  }
  return tasks
}

export function createSimpleFixture(taskStructure = []) {
  return createUser().then(createdUser => {
    const seed = {
      matter: {
        teamMembers: [createdUser],
        matterAdmins: [createdUser],
        projects: [
          {
            name: faker.company.companyName(),
            tasks: generateTaskStructure(taskStructure),
          },
        ],
      },
    }
    let fixture = generateFixture(seed)
    return new Promise((resolve, reject) =>
      resolve({ user: createdUser, fixture: fixture })
    )
  })
}

function setDateForTask(
  date,
  type,
  taskId,
  workstreamId,
  matterId,
  updateSubtaskDates = false,
  maintainTaskConsistencyUpdate = true
) {
  let body = {}
  body[`${type}`] = date
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}?updateSubtaskDates=${updateSubtaskDates}&maintainTaskConsistencyUpdate=${maintainTaskConsistencyUpdate}`,
    method: 'PATCH',
    body: body,
  })
}

export function setPlannedStartDateForTask(
  date,
  taskId,
  workstreamId,
  matterId,
  updateSubtaskDates = false,
  maintainTaskConsistencyUpdate = true
) {
  return setDateForTask(
    date,
    'plannedStartDate',
    taskId,
    workstreamId,
    matterId,
    updateSubtaskDates,
    maintainTaskConsistencyUpdate
  )
}

export function setPlannedEndDateForTask(
  date,
  taskId,
  workstreamId,
  matterId,
  updateSubtaskDates,
  maintainTaskConsistencyUpdate
) {
  return setDateForTask(
    date,
    'plannedEndDate',
    taskId,
    workstreamId,
    matterId,
    updateSubtaskDates,
    maintainTaskConsistencyUpdate
  )
}

export function setActualStartDateForTask(
  date,
  taskId,
  workstreamId,
  matterId
) {
  return setDateForTask(date, 'actualStartDate', taskId, workstreamId, matterId)
}
export function setActualEndDateForTask(date, taskId, workstreamId, matterId) {
  return setDateForTask(date, 'actualEndDate', taskId, workstreamId, matterId)
}

function shiftTask(type, shift, taskId, workstreamId, matterId) {
  let body = { type: type, shift: shift }
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/shift`,
    method: 'POST',
    body: body,
  })
}

export function shiftTaskIntoTheFuture(
  type,
  days,
  taskId,
  workstreamId,
  matterId
) {
  return shiftTask(type, days, taskId, workstreamId, matterId)
}

export function shiftTaskIntoThePast(
  type,
  days,
  taskId,
  workstreamId,
  matterId
) {
  return shiftTask(type, -days, taskId, workstreamId, matterId)
}

export function getTask(taskId, workstreamId, matterId) {
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}`,
    method: 'GET',
  })
}

export function linkTasks(tasks, isLinked, taskId, workstreamId, matterId) {
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/link`,
    method: 'POST',
    body: {
      tasks: tasks,
      isLinked: isLinked,
    },
  })
}
export function setTaskNotStarted(taskId, workstreamId, matterId) {
  let body = {
    status: 'not-started',
  }
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}`,
    method: 'PATCH',
    body: body,
  })
}

export function setTaskInProgress(taskId, workstreamId, matterId) {
  let body = {
    status: 'in-progress',
  }
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}`,
    method: 'PATCH',
    body: body,
  })
}

export function setTaskDone(taskId, workstreamId, matterId) {
  let body = {
    status: 'done',
  }
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}`,
    method: 'PATCH',
    body: body,
  })
}

export const shift = (matterId, workstreamId, taskId, body) => {
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/shift`,
    method: 'PATCH',
    body: body,
  })
}

export const bulkShift = (matterId, workstreamId, body) => {
  return cy.apiSpecRequest({
    url: `${Cypress.env(
      'serverBaseUrl'
    )}/matter/${matterId}/workstreams/${workstreamId}/bulkShift`,
    method: 'PATCH',
    body: body,
  })
}
