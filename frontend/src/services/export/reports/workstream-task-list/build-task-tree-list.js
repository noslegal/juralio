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
  LABEL_TYPES,
  TASK_MAP_LEVELS_INTEGER_LOOKUP,
  TASK_STATUS,
} from '../../../../app/constants'
import { sortLabels } from '../../../../app/task-details/task-label/task-label-helpers'
import { getDateDisplayString } from '../../../helpers/date-helper'
import { getCompletionDisplayDate } from '../common/report-date-helpers'
import { getDownloadedByText, getTaskTeam } from '../common/report-text-helpers'
import {
  getCountDetails,
  getMatterReferenceNumber,
  getWorkstreamLabel,
  getWorkstreamName,
} from './header-details-helper'
export const buildTaskList = (
  t,
  taskSummary,
  matter,
  project,
  taskStatusPerRow,
  username,
  selectedLevel,
  includeLabels
) => {
  const downloadedByText = getDownloadedByText(t)
  const countsDetail = getCountDetails(t, project.taskCounts)
  const matterReferenceNumber = getMatterReferenceNumber(t, matter)

  taskSummary.push(
    [
      '',
      t('entity.client') + ':',
      matter.clientName,
      '',
      countsDetail.notStartedCount,
      '',
      '',
      downloadedByText,
    ],
    [
      '',
      t('entity.matter') + ':',
      matter.name + ' / ' + matterReferenceNumber,
      '',
      countsDetail.inProgressCount,
      '',
    ],
    [
      project.isPrivate ? 'Private' : '',
      getWorkstreamLabel(t, matter, project),
      getWorkstreamName(t, matter, project),
      '',
      countsDetail.completedCount,
    ],
    [t('exports.common.taskList'), '', '', '', countsDetail.totalCount, ''],
    [' '],
    [
      t('exports.tableHeadings.levelTaskId'),
      t('exports.tableHeadings.type'),
      t('exports.tableHeadings.taskName'),
      '',
      t('exports.tableHeadings.completedOrDue'),
      includeLabels ? t('exports.tableHeadings.labels') : '',
      t('exports.common.internalTeam'),
      t('exports.common.externalTeam'),
    ]
  )

  if (project.tasks) {
    project.tasks.forEach(task => {
      buildTaskTree(
        t,
        taskSummary,
        task,
        taskStatusPerRow,
        selectedLevel,
        includeLabels
      )
    })
  }
}

const buildTaskTree = (
  t,
  taskSummary,
  task,
  taskStatusPerRow,
  selectedLevel,
  includeLabels
) => {
  if (task.status === TASK_STATUS.NOT_REQUIRED) return
  if (task.level > selectedLevel) return
  taskSummary.push(buildTaskDetailRow(t, task, includeLabels))
  taskStatusPerRow.push(task.status)
  task.tasks.forEach(task => {
    if (task?.tasks) {
      buildTaskTree(
        t,
        taskSummary,
        task,
        taskStatusPerRow,
        selectedLevel,
        includeLabels
      )
    }
  })
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

const buildTaskDetailRow = (t, task, includeLabels) => {
  return [
    getLevelText(task.level, task.referenceNumber.slice(3)),
    task.isMilestone
      ? 'Milestone'
      : task.isDeliverable
        ? 'Deliverable'
        : task.level === 1
          ? 'Phase'
          : 'Task',
    task.name,
    '',
    getCompletionEntry(task),
    includeLabels ? getLabels(task) : '',
    getTaskTeam(t, task, true),
    getTaskTeam(t, task, false),
  ]
}

const getCompletionEntry = task => {
  const displayDate = getCompletionDisplayDate(task)
  return displayDate.length > 1
    ? getDateDisplayString(displayDate, undefined, true)
    : displayDate
}

const getLevelText = (level, id) => {
  return (
    new Array(level - 1).fill('  ').join('') +
    TASK_MAP_LEVELS_INTEGER_LOOKUP[level] +
    '#' +
    id
  )
}
