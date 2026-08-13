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

export const getCountDetails = (t, taskCounts) => {
  const countsDetail = {}
  countsDetail.notStartedCount =
    taskCounts.notStartedCount === 0
      ? t('exports.common.noNotStartedTasks')
      : taskCounts.notStartedCount +
        ' ' +
        t('taskStatus.not-started').toLowerCase()

  countsDetail.inProgressCount =
    taskCounts.inProgressCount === 0
      ? t('exports.common.noInProgressTasks')
      : taskCounts.inProgressCount +
        ' ' +
        t('taskStatus.in-progress').toLowerCase()

  countsDetail.completedCount =
    taskCounts.doneCount === 0
      ? t('exports.common.noCompletedTasks')
      : taskCounts.doneCount + ' ' + t('exports.common.completed')

  // The API sends per-status counts (taskCounts) but no top-level total, so
  // derive it. Not-required tasks are excluded, matching the roadmap (which
  // filters NOT_REQUIRED) and the status breakdown shown above.
  const totalCount =
    taskCounts.notStartedCount +
    taskCounts.inProgressCount +
    taskCounts.doneCount

  countsDetail.totalCount =
    totalCount === 1
      ? t('exports.common.oneTaskInTotal')
      : totalCount + ' ' + t('exports.common.tasksInTotal')

  return countsDetail
}

export const getWorkstreamName = (t, matter, workstream) => {
  if (matter.numProjects === 1) return ''
  return workstream.name
}

export const getWorkstreamLabel = (t, matter, workstream) => {
  if (matter.numProjects === 1) return ''
  const workstreamText = t('entity.workstream')
  return (
    workstreamText + ' ' + workstream.referenceNumber.replace('P', '') + ':'
  )
}

export const getMatterReferenceNumber = (t, matter) =>
  matter.userDefinedReferenceNumber?.length > 0
    ? matter.userDefinedReferenceNumber
    : t('common.none')
