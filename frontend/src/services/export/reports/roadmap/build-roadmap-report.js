/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  DATE_FORMAT_DAY_MONTH_YEAR,
  LABEL_TYPES,
  TASK_MAP_LEVELS_INTEGER_LOOKUP,
  TASK_STATUS,
} from '../../../../app/constants'
import { sortLabels } from '../../../../app/task-details/task-label/task-label-helpers'
import { getDateDisplayString } from '../../../helpers/date-helper'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import { getDownloadedByText } from '../common/report-text-helpers'
import {
  getCountDetails,
  getMatterReferenceNumber,
  getWorkstreamLabel,
  getWorkstreamName,
} from '../workstream-task-list/header-details-helper'

export const getEarliestStartTime = tasks => {
  let earliest = new Date()
  tasks.forEach(task => {
    const psd = task.plannedStartDate
      ? new Date(task.plannedStartDate)
      : earliest
    const asd = task.actualStartDate ? new Date(task.actualStartDate) : earliest
    if (psd && psd < earliest) {
      earliest = psd
    }
    if (asd && asd < earliest) {
      earliest = asd
    }
  })
  return earliest
}

export const getLatestEndTime = tasks => {
  let latest = new Date()
  tasks.forEach(task => {
    const ped = task.plannedEndDate ? new Date(task.plannedEndDate) : latest
    const aed = task.actualEndDate ? new Date(task.actualEndDate) : latest
    if (ped && ped > latest) {
      latest = ped
    }
    if (aed && aed > latest) {
      latest = aed
    }
  })
  return latest
}

const rowLength = 56

export const buildRoadmapContent = (
  t,
  content,
  matter,
  project,
  username,
  flatTasks,
  options
) => {
  const downloadedByText = getDownloadedByText(t)
  const titleRow = new Array(rowLength).fill('')
  const countsDetail = getCountDetails(t, project.taskCounts)

  titleRow[0] = t('exports.roadmap.level')
  titleRow[1] = t('exports.roadmap.type')
  titleRow[2] = t('exports.roadmap.name')
  if (options.includeLabels) {
    titleRow[rowLength - 3] = t('exports.tableHeadings.labels')
  }
  titleRow[rowLength - 2] = t('exports.common.internalTeam')
  titleRow[rowLength - 1] = t('exports.common.externalTeam')

  content.push(
    [
      '',
      '',
      t('entity.client') + ':',
      matter.clientName,
      ...new Array(22).fill(''),
      countsDetail.notStartedCount,
      '',
      ...new Array(27).fill(''),
      downloadedByText,
    ],
    [
      '',
      '',
      t('entity.matter') + ':',
      matter.name + ' / ' + getMatterReferenceNumber(t, matter),
      ...new Array(22).fill(''),
      countsDetail.inProgressCount,
      '',
      ...new Array(25).fill(''),
    ],
    [
      project.isPrivate ? 'Private' : '',
      '',
      getWorkstreamLabel(t, matter, project),
      getWorkstreamName(t, matter, project),
      ...new Array(22).fill(''),
      countsDetail.completedCount,
      '',
      ...new Array(6).fill(''),
      '',
      ...new Array(19).fill(''),
    ],
    [
      t('exports.common.roadmap'),
      ...new Array(25).fill(''),
      countsDetail.totalCount,
      '',
      ...new Array(25).fill(''),
    ],
    [],

    titleRow
  )

  const startDate = getEarliestStartTime(flatTasks)
  const endDate = getLatestEndTime(flatTasks)
  const totalRoadmapCells = 40
  let secondsPerSquare =
    ((endDate.getTime() - startDate.getTime()) * 1000) / totalRoadmapCells

  if (secondsPerSquare === 0) secondsPerSquare = 1

  flatTasks.forEach(task => {
    buildRoadmapRow(
      t,
      content,
      task,
      rowLength,
      secondsPerSquare,
      startDate,
      options
    )
  })
}

const getLevelText = (level, id) => {
  return (
    new Array(level - 1).fill('  ').join('') +
    TASK_MAP_LEVELS_INTEGER_LOOKUP[level] +
    '#' +
    id
  )
}

export const getStartTime = task => {
  if (
    task.status === TASK_STATUS.NOT_STARTED &&
    task.plannedStartDate !== null
  ) {
    return task.plannedStartDate
  }
  if (
    task.status === TASK_STATUS.IN_PROGRESS ||
    task.status === TASK_STATUS.DONE
  ) {
    return task.actualStartDate
  }
  return null
}

export const getEndTime = task => {
  if (task.status === TASK_STATUS.NOT_STARTED && task.plannedEndDate !== null) {
    return task.plannedEndDate
  }
  if (task.status === TASK_STATUS.DONE) {
    return task.actualEndDate
  }
  if (task.status === TASK_STATUS.IN_PROGRESS && task.plannedEndDate !== null) {
    return task.plannedEndDate
  }
  return null
}

const getLabels = task => {
  let labelString = ''
  if (task.labels) {
    let sortedLabels = task.labels.sort(sortLabels)
    const formatName = label =>
      label.type === LABEL_TYPES.USER_DEFINED ? `#${label.name}` : label.name

    const extra = sortedLabels.length - 2

    labelString = sortedLabels
      .slice(0, 2)
      .map(l => formatName(l))
      .join(', ')
    if (extra > 0) {
      labelString = labelString + ` (+${extra})`
    }
  }
  return labelString
}

export const buildRoadmapRow = (
  t,
  content,
  task,
  rowLength,
  secondsPerSquare,
  earliestTime,
  options
) => {
  const row = new Array(rowLength).fill('')
  const name = task.name
  const level = task.level
  const startTime = getStartTime(task)
  const endTime = getEndTime(task)
  let startCell = 8
  let dateCellLength = 5

  let squaresBefore = 0
  let squaresToFill = 1

  if (startTime !== null && endTime !== null) {
    const secondsFromEarliestToStart =
      (new Date(startTime).getTime() - earliestTime.getTime()) * 1000
    squaresBefore = Math.floor(secondsFromEarliestToStart / secondsPerSquare)
    if (squaresBefore === 40) {
      squaresBefore = 39
    }
    const taskLengthInSeconds =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) * 1000
    squaresToFill = Math.max(
      1,
      Math.ceil(taskLengthInSeconds / secondsPerSquare)
    )
    if (task.isMilestone) {
      row[startCell - dateCellLength + squaresBefore + 5] = '◆'
    } else if (task.isDeliverable) {
      row[startCell - dateCellLength + squaresBefore + 5] = '◼️'
    } else {
      row[startCell - dateCellLength + squaresBefore] = getDateDisplayString(
        new Date(startTime),
        DATE_FORMAT_DAY_MONTH_YEAR
      )
    }

    row[startCell + squaresToFill + squaresBefore] = getDateDisplayString(
      new Date(endTime),
      DATE_FORMAT_DAY_MONTH_YEAR
    )
  }
  if (startTime !== null && endTime === null) {
    const secondsFromEarliestToStart =
      (new Date(startTime).getTime() - earliestTime.getTime()) * 1000
    squaresBefore = Math.floor(secondsFromEarliestToStart / secondsPerSquare)
    if (squaresBefore === 40) {
      squaresBefore = 39
    }
    squaresToFill = 1
    row[startCell - dateCellLength + squaresBefore] = getDateDisplayString(
      new Date(startTime),
      DATE_FORMAT_DAY_MONTH_YEAR
    )

    row[startCell + squaresToFill + squaresBefore] = t(
      'exports.roadmap.dates.noEnd'
    )
  }
  if (startTime === null && endTime !== null) {
    const secondsFromEarliestToEnd =
      (new Date(endTime).getTime() - earliestTime.getTime()) * 1000
    squaresBefore = Math.floor(secondsFromEarliestToEnd / secondsPerSquare) - 1
    if (squaresBefore === 40) {
      squaresBefore = 39
    }
    squaresToFill = 1
    if (task.isMilestone) {
      row[startCell - dateCellLength + squaresBefore + 5] = '◆'
    } else if (task.isDeliverable) {
      row[startCell - dateCellLength + squaresBefore + 5] = '◼️'
    } else {
      row[startCell - dateCellLength + squaresBefore] = t(
        'exports.roadmap.dates.noStart'
      )
    }

    row[startCell + squaresToFill + squaresBefore] = getDateDisplayString(
      new Date(endTime),
      DATE_FORMAT_DAY_MONTH_YEAR
    )
  }

  if (startTime == null && endTime === null) {
    const secondsFromEarliestToToday =
      (new Date().getTime() - earliestTime.getTime()) * 1000
    squaresBefore = Math.floor(secondsFromEarliestToToday / secondsPerSquare)
    if (squaresBefore === 40) {
      squaresBefore = 39
    }
    squaresToFill = 1
    const column = startCell - dateCellLength + squaresBefore
    if (task.isMilestone) {
      row[column < 1000 ? column : 3] = '◆' // This is for Roadmap with 0 dates.
      row[column < 1000 ? column + 1 : 4] = t('exports.roadmap.dates.noDates') // This is for Roadmap with 0 dates.
    } else {
      row[column < 1000 ? column : 3] = t('exports.roadmap.dates.noDates') // This is for Roadmap with 0 dates.
    }
    if (task.isDeliverable) {
      row[column < 1000 ? column : 3] = '◼️' // This is for Roadmap with 0 dates.
      row[column < 1000 ? column + 1 : 4] = t('exports.roadmap.dates.noDates') // This is for Roadmap with 0 dates.
    } else {
      row[column < 1000 ? column : 3] = t('exports.roadmap.dates.noDates') // This is for Roadmap with 0 dates.
    }
  }

  const internalTeam = task.teamMembers.filter(t => !t.isExternal)
  const externalTeam = task.teamMembers.filter(t => t.isExternal)

  row[0] = getLevelText(level, task.referenceNumber.slice(3))
  row[1] = task.isMilestone
    ? 'Milestone'
    : task.isDeliverable
      ? 'Deliverable'
      : task.level === 1
        ? 'Phase'
        : 'Task'

  row[2] = name
  if (options.includeLabels) {
    row[rowLength - 3] = getLabels(task)
  }
  if (internalTeam.length > 0) {
    row[rowLength - 2] =
      internalTeam.length > 2
        ? `${internalTeam[0].firstname} ${internalTeam[0].lastname} ${t(
            'exports.roadmap.andMore',
            { count: internalTeam.length - 1 }
          )}`
        : internalTeam.map(u => formatUserDisplayName(u)).join(', ')
  }
  if (externalTeam.length > 0) {
    row[rowLength - 1] =
      externalTeam.length > 2
        ? `${externalTeam[0].firstname} ${externalTeam[0].lastname} ${t(
            'exports.roadmap.andMore',
            { count: externalTeam.length - 1 }
          )}`
        : externalTeam.map(u => formatUserDisplayName(u)).join(', ')
  }
  content.push(row)
}
