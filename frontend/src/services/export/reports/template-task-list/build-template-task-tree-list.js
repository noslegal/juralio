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

import { TASK_MAP_LEVELS_INTEGER_LOOKUP } from '../../../../app/constants'

export const buildTaskTree = (t, taskList, task, selectedLevel) => {
  if (task.level > selectedLevel) return
  taskList.push(buildTaskDetailRow(t, task))
  task.tasks.forEach(task => {
    if (task?.tasks) {
      buildTaskTree(t, taskList, task, selectedLevel)
    }
  })
}

const buildTaskDetailRow = (t, task) => {
  return [getLevelText(task.level, task.referenceNumber.slice(3)), task.name]
}

const getLevelText = (level, id) => {
  return (
    new Array(level - 1).fill('  ').join('') +
    TASK_MAP_LEVELS_INTEGER_LOOKUP[level] +
    '#' +
    id
  )
}

export const buildReportContent = (
  t,
  taskList,
  template,
  downloadedByText,
  options
) => {
  // Add the Header Content
  taskList.push(
    [
      '',
      '',
      template.name,
      '',
      '',
      t('exports.common.templateReferenceNumber'),
    ],
    ['', '', '', '', '', template.referenceNumber],
    [''],
    [t('exports.common.templateTaskList'), '', '', '', '', downloadedByText],
    [''],
    [
      t('exports.tableHeadings.levelTaskId'),
      t('exports.tableHeadings.taskName'),
      [''],
      [''],
      [''],
      [''],
    ]
  )

  // Construct tasks list
  const tasks = template.tasks
  tasks.forEach(task => {
    buildTaskTree(t, taskList, task, options.selectedLevel)
  })
}
