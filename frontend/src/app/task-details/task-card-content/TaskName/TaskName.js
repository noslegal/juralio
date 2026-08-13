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

import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS, TASK_STATUS } from '../../../../app/constants'
import { stopEditingTaskName } from '../../../../app/task-map/selected-task/selected-task-actions'
import MilestoneIcon from '../../../../assets/images/JurMilestone'
import ReadEditField from '../../../../components/inputs/read-edit-field/ReadEditField'
import { checkTextHasNonWhitespaceContent } from '../../../../services/helpers/text/text-util-helper'
import withRouter from '../../../../services/navigation/WithRouter'
import colorModifiers from '../../../../theme/color-modifiers'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import OpenInTaskDetailsButton from '../../task-card-content/task-notes/post/detail/OpenInTaskDetailsButton'
import JurDeliverable from '../../../../assets/images/JurDeliverable'
import { isPlannedEndDateOverdue } from '../../../roadmap/helpers/task-dates-helper'

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      minHeight: 0,
      padding: theme.spacing(1.5, 3, 1.5, 3),
      paddingLeft: 0,
    },
  },
  readOnlyClass: {
    color: juralioColours.darkText.primary,
    width: '100%',
  },
  icon: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    marginRight: theme.spacing(1),
  },
})
const TaskName = props => {
  const task = props.task
  const { classes } = makeStyles()(styles)()
  const [validationMessage, setValidationMessage] = useState('')
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const editingTaskName = useSelector(state => state.selectedTask.isEditingName)

  const updateTaskName = value => {
    if (checkTextHasNonWhitespaceContent(value)) {
      dispatch(stopEditingTaskName())
      return props.updateHandler({ name: value })
    }
    setValidationMessage(t('commonValidationMessages.requiredField'))
    return Promise.reject()
  }

  const exitEditState = () => dispatch(stopEditingTaskName())

  const clearValidation = () => setValidationMessage('')

  return (
    <div className={classes.root} data-test="task-name-full-panel">
      {task.isMilestone && (
        <MilestoneIcon className={classes.icon} data-test="milestone-icon" />
      )}
      {task.isDeliverable && (
        <JurDeliverable
          data-test="deliverable-icon"
          stroke={
            task.status === TASK_STATUS.NOT_STARTED &&
            isPlannedEndDateOverdue(task)
              ? rawColours.error.primary
              : task.status === TASK_STATUS.NOT_STARTED
                ? juralioColours.taskStatus.notStarted
                : task.status === TASK_STATUS.IN_PROGRESS
                  ? juralioColours.taskStatus.inProgress
                  : task.status === TASK_STATUS.DONE
                    ? juralioColours.taskStatus.done
                    : rawColours.status.template.dark
          }
        />
      )}
      <div data-test="task-name" style={{ width: '100%' }}>
        <ReadEditField
          value={task.name}
          onBlur={updateTaskName}
          onNoChangeBlur={exitEditState}
          validationMessage={validationMessage}
          clearValidation={clearValidation}
          maxLength={MAX_FIELD_LENGTHS.TASK_NAME}
          variant="h5"
          viewOnly={props.isReadOnly}
          usageContext="TaskName"
          readOnlyClass={classes.readOnlyClass}
          textStyle={{ color: juralioColours.darkText.primary }}
          disableClickToEdit={!props.isEditor}
          editMode={editingTaskName}
          cancelHandler={exitEditState}
          wrapText
        />
      </div>
      {props.isOverview && <OpenInTaskDetailsButton />}
    </div>
  )
}

TaskName.propTypes = {
  /** updateHandler */
  updateHandler: PropTypes.func.isRequired,
  /** backgroundColor */
  backgroundColor: PropTypes.string,
  /** selectItemInList */
  selectItemInList: PropTypes.func,
}

export default withRouter(TaskName)
