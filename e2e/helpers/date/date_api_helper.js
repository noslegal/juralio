import dayjs from 'dayjs'
import { DATE_FORMAT_FULL } from './date_constants'

export const getDatePayload = function (date) {
  return date.toISOString()
}

export const getTodaySubtractDays = days =>
  dayjs().subtract(days, 'day').toISOString()

export const getTodayAddDays = days => dayjs().add(days, 'day').toISOString()

export const datePayloadGenerator = function (subtractOrAdd, days) {
  if (subtractOrAdd == '-') {
    return calculateEndDateSubtract(days)
  } else if (subtractOrAdd == '+') {
    return calculateEndDateAdd(days)
  }
}

export function calculateEndDateAdd(days) {
  return dayjs().add(days, 'day').endOf('day').toISOString()
}
export function calculateEndDateSubtract(days) {
  return dayjs().subtract(days, 'day').endOf('day').toISOString()
}

export function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }
  const currentDate = dayjs().startOf('day')
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return 'Today'
    if (comparison === 1) return 'Tomorrow'
    if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}

export function getPayloadForDate(date) {
  return getDateDisplayString(date, false, true)
}

export function updatePED(matterId, projectId, taskId, subtractOrAdd, days) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: {
        id: taskId,
        matterId: matterId,
        project: projectId,
        plannedEndDate: datePayloadGenerator(subtractOrAdd, days),
      },
    })
    .its('body')
}

export const getDateAtStartOfDay = date => {
  let startOfDay = new Date(date)
  startOfDay.setHours(0)
  startOfDay.setMinutes(0)
  startOfDay.setSeconds(0)
  startOfDay.setMilliseconds(0)
  return startOfDay
}

export function setPSD(matterId, projectId, taskId, date) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: {
        id: taskId,
        matterId: matterId,
        project: projectId,
        plannedStartDate: getDatePayload(date),
      },
    })
    .its('body')
}

export function updatePSD(matterId, projectId, taskId, subtractOrAdd, days) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: {
        id: taskId,
        matterId: matterId,
        project: projectId,
        plannedStartDate: datePayloadGenerator(subtractOrAdd, days),
      },
    })
    .its('body')
}

export function updateAED(matterId, projectId, taskId, subtractOrAdd, days) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: {
        id: taskId,
        matterId: matterId,
        project: projectId,
        actualEndDate: datePayloadGenerator(subtractOrAdd, days),
      },
    })
    .its('body')
}

export function updateASD(matterId, projectId, taskId, subtractOrAdd, days) {
  return cy
    .request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/matter/${matterId}/workstreams/${projectId}/task/${taskId}?maintainTaskConsistencyUpdate=true`,
      method: 'PATCH',
      body: {
        id: taskId,
        matterId: matterId,
        project: projectId,
        actualStartDate: datePayloadGenerator(subtractOrAdd, days),
      },
    })
    .its('body')
}
