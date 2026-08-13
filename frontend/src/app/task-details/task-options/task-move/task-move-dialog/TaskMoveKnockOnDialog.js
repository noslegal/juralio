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

import AlertIcon from '@mui/icons-material/ReportProblem'
import { Typography } from '@mui/material'
import React from 'react'
import TaskChip from '../../../../../components/data-display/task-chip/TaskChip'
import TaskUpdateChip from '../../../../../components/data-display/task-update-chip/TaskUpdateChip'
import juralioColours from '../../../../../theme/juralio-colours'
import { MattersIcon } from '../../../../../theme/navigation/CommonIcons'

const getPrevDate = (updateObj, task) => {
  if (updateObj['plannedStartDate']) {
    return task.plannedStartDate
  }
  if (updateObj['plannedEndDate']) {
    return task.plannedEndDate
  }
  if (updateObj['actualStartDate']) {
    return task.actualStartDate
  }
  if (updateObj['actualEndDate']) {
    return task.actualEndDate
  }
  return null
}
const getDateChanges = updateObj => {
  let changes = []
  let keys = Object.keys(updateObj)
  if (keys.includes('plannedStartDate')) {
    changes.push({ plannedStartDate: updateObj['plannedStartDate'] })
  }
  if (keys.includes('plannedEndDate')) {
    changes.push({ plannedEndDate: updateObj['plannedEndDate'] })
  }
  if (keys.includes('actualStartDate')) {
    changes.push({ actualStartDate: updateObj['actualStartDate'] })
  }
  if (keys.includes('actualEndDate')) {
    changes.push({ actualEndDate: updateObj['actualEndDate'] })
  }
  return changes
}

export const taskMoveKnockOnDialog = (
  knockOnEffects,
  task,
  projectTasks,
  t,
  callback = () => {},
  cancelMove,
  displayConfirmationDialog,
  isArchive = false,
  dispatch = false
) => {
  let tasks = []
  knockOnEffects.filter(i => {
    if (tasks.find(t => t.id === i.id)) {
      let foundTask = tasks.find(t => t.id === i.id)
      let newObj = { ...foundTask, ...i }
      tasks = tasks.filter(ft => ft.id !== foundTask.id)
      tasks.push(newObj)
    } else {
      tasks.push(i)
    }
    return true
  })
  const blockerIssues = tasks.filter(t => t.blocker)
  tasks = tasks.filter(t => !t.blocker)
  const statusChanges = tasks.filter(t => t.newStatus).length
  const dateChanges =
    tasks.length > 0
      ? tasks
          .map(t => {
            let count = 0
            t.plannedStartDate && count++
            t.plannedEndDate && count++
            t.actualStartDate && count++
            t.actualEndDate && count++
            return count
          })
          .reduce((a, b) => a + b)
      : 0

  tasks = tasks.sort((a, b) => {
    return projectTasks.find(t => t.id === a.id).level >
      projectTasks.find(t => t.id === b.id).level
      ? 1
      : -1
  })

  const dialogContent = (
    <>
      <Typography data-test="dialog-prompt-text">
        {t('taskChange.promptText')}
      </Typography>
      {blockerIssues.length > 0 && (
        <div
          data-test="task-blocker-alert"
          style={{
            display: 'flex',
            marginBottom: '12px',
            marginTop: '12px',
          }}
        >
          <AlertIcon
            style={{
              color: juralioColours.alert,
              alignSelf: 'center',
              paddingRight: '12px',
            }}
          />
          <Typography>
            {t('taskChange.taskBlocker1') +
              blockerIssues.length +
              t('taskChange.taskBlocker2', {
                plural: blockerIssues.length > 1 ? 's' : '',
                singular: blockerIssues.length > 1 ? 'them' : 'it',
              })}
          </Typography>
        </div>
      )}
      <Typography
        data-test="change-counter"
        variant="button"
        style={
          blockerIssues.length > 0
            ? { marginTop: '0px' }
            : { marginTop: '16px' }
        }
      >
        {dateChanges > 0 && `${t('taskChange.dateChange')} ${dateChanges}`}
        {statusChanges > 0 && dateChanges > 0 ? ', ' : ' '}
        {statusChanges > 0 &&
          `${t('taskChange.statusChange')} ${statusChanges}`}
      </Typography>
      {tasks.map(item => {
        let foundTasks = projectTasks.find(t => t.id === item.id)

        if (!foundTasks) {
          return null
        }

        const isLinkChange = foundTasks.datesLinkedToSiblings && item.isLinkMove

        task.level = foundTasks.level + 1

        return (
          <div
            data-test="task-update-chip"
            key={item.id}
            style={{ padding: '8px' }}
          >
            <TaskChip
              isLink={false}
              task={foundTasks}
              noHover={true}
              closeHandler={() => {}}
            />
            <TaskUpdateChip
              prevDate={getPrevDate(item, foundTasks)}
              newStatus={item.newStatus}
              statusChange={item.newStatus}
              task={foundTasks}
              changeTask={task}
              dateChanges={getDateChanges(item)}
              isLinkChange={isLinkChange}
            />
          </div>
        )
      })}
    </>
  )

  const options = {
    actionText: isArchive ? t('unarchiveDialog.button') : t('common.confirm'),
    titleText: isArchive
      ? t('unarchiveDialog.titleText')
      : t('taskMove.moveTask'),
    promptText: dialogContent,
    dontTranslatePromptText: true,
    usageContext: 'TaskMoveKnockOnEffects',
    cancel: cancelMove,
    headerIcon: isArchive ? MattersIcon : null,
  }
  //fix for new components using dispatch vs older ones
  if (dispatch) {
    dispatch(
      displayConfirmationDialog(options, () => {
        callback()
      })
    )
  } else {
    displayConfirmationDialog(options, () => {
      callback()
    })
  }
}
