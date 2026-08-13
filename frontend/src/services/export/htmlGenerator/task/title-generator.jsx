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

import React from 'react'
import {
  DATE_FORMAT_FULL,
  LABEL_TYPES,
  TASK_MAP_LEVELS_INTEGER_LOOKUP,
  TASK_STATUS,
} from '../../../../app/constants'
import rawColours from '../../../../theme/raw-colours'
import { getDateDisplayString } from '../../../helpers/date-helper'
import { getStatusColour } from '../../../helpers/task/task-status-colour-helper'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import StylisedP from '../components/StylisedP.jsx'

const getLabelColour = label => {
  if (label.type === LABEL_TYPES.USER_DEFINED) {
    return '#d9d9d9'
  }
  if (label.type === LABEL_TYPES.WORKFLOW) {
    return '#000000'
  }
  if (label.type === LABEL_TYPES.RISK) {
    if (label.modifier === 'amber') {
      return rawColours.riskLabels.amber.primary
    }
    if (label.modifier === 'green') {
      return rawColours.riskLabels.green.primary
    }
    return rawColours.riskLabels.red.primary
  }
  return 'red'
}

const generateLabels = (t, labels) => {
  return (
    <StylisedP>
      {t('common.labels')}: &nbsp;
      {labels.map(l => (
        <>
          <span
            style={{
              backgroundColor: getLabelColour(l),
              color: l.type === LABEL_TYPES.WORKFLOW ? 'white' : 'black',
            }}
          >
            {l.type === LABEL_TYPES.USER_DEFINED ? `#${l.name}` : l.name}
          </span>
          &nbsp;
        </>
      ))}
    </StylisedP>
  )
}
const generateTeamMembers = (t, task) => {
  if (task.teamMembers?.length === 0) {
    return (
      <StylisedP>
        {t('exports.reportDownload.taskDetails.noAssignees')}
      </StylisedP>
    )
  }
  return (
    <StylisedP>
      {task.teamMembers.map((ttm, i) => {
        return (
          <>
            <b>{formatUserDisplayName(ttm)}</b>
            {i < task.teamMembers?.length - 2 ? ', ' : ''}
            {i === task.teamMembers?.length - 2 ? ` ${t('common.and')} ` : ''}
          </>
        )
      })}
      {task.teamMembers?.length > 1
        ? ` ${t('exports.reportDownload.taskDetails.areResponsibleForIt')}.`
        : ` ${t('exports.reportDownload.taskDetails.isResponsibleForIt')}.`}
    </StylisedP>
  )
}

const generateDates = (t, task) => {
  const hasStartDate = task.plannedStartDate || task.actualStartDate
  const hasEndDate = task.plannedEndDate || task.actualEndDate
  if (!hasStartDate && !hasEndDate) {
    return (
      <StylisedP> {t('exports.reportDownload.taskDetails.noDates')}.</StylisedP>
    )
  }

  let joiningString = ''
  if (hasStartDate && hasEndDate) {
    joiningString = joiningString + ` ${t('common.and')}`
  }
  if (hasEndDate && task.status === TASK_STATUS.DONE) {
    joiningString =
      joiningString + t('exports.reportDownload.taskDetails.finishedOn')
  }
  if (hasEndDate && task.status !== TASK_STATUS.DONE) {
    joiningString =
      joiningString + t('exports.reportDownload.taskDetails.dueToBeFinished')
  }

  return (
    <StylisedP>
      {t('exports.reportDownload.taskDetails.thisTask')}
      {hasStartDate &&
        (task.status === TASK_STATUS.NOT_STARTED
          ? t('exports.reportDownload.taskDetails.dueToStart')
          : t('exports.reportDownload.taskDetails.wasStartedOn'))}
      <b>
        {hasStartDate &&
          (task.status === TASK_STATUS.NOT_STARTED
            ? getDateDisplayString(
                task.plannedStartDate,
                DATE_FORMAT_FULL,
                true
              )
            : getDateDisplayString(
                task.actualStartDate,
                DATE_FORMAT_FULL,
                true
              ))}
      </b>
      {joiningString}
      <b>
        {hasEndDate &&
          (task.status === TASK_STATUS.DONE
            ? getDateDisplayString(task.actualEndDate, DATE_FORMAT_FULL, true)
            : getDateDisplayString(
                task.plannedEndDate,
                DATE_FORMAT_FULL,
                true
              ))}
      </b>
    </StylisedP>
  )
}

export const titleGenerator = (t, task) => {
  return (
    <div>
      <StylisedP style={{ display: 'flex' }}>
        {t('exports.reportDownload.taskDetails.thisIsAJuralio')}&nbsp;
        <b data-test="title-task-level">
          {t('common.level')}&nbsp;{TASK_MAP_LEVELS_INTEGER_LOOKUP[task.level]}
        </b>
        &nbsp;
        {t('exports.reportDownload.taskDetails.itsNumberIs', {
          task: task.level === 1 ? 'phase' : 'task',
        })}
        <b data-test="title-task-reference-number">#{task.referenceNumber}</b>
        &nbsp;{t('exports.reportDownload.taskDetails.withinThisMatter')}
      </StylisedP>
      <StylisedP
        style={{ fontSize: '32px', fontWeight: '400' }}
        dataTest="title-task-name"
      >
        {task.name}
      </StylisedP>
      <StylisedP style={{ display: 'flex' }}>
        {task.isMilestone && (
          <span
            style={{ backgroundColor: 'black', color: 'white' }}
            data-test="title-task-milestone-chip"
          >
            {t('common.milestone')}
          </span>
        )}
        {task.isDeliverable && (
          <span
            style={{ backgroundColor: 'black', color: 'white' }}
            data-test="title-task-milestone-chip"
          >
            {t('common.deliverable')}
          </span>
        )}
        &nbsp;
        <span
          style={{ backgroundColor: getStatusColour(task.status) }}
          data-test="title-task-status-chip"
        >
          {task.status}
        </span>
      </StylisedP>
      {task.labels?.length > 0 && generateLabels(t, task.labels)}
      {generateDates(t, task)}
      {generateTeamMembers(t, task)}
    </div>
  )
}
