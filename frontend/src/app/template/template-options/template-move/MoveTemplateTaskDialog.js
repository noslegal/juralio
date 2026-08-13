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

import MoveIcon from '@mui/icons-material/CallMade'
import { DialogContent, Typography } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import classNames from 'classnames'
import { StatusCodes } from 'http-status-codes'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  CONFIG,
  DESKTOP_DIALOG_WIDTH,
  TASK_MENU_CONTEXT,
} from '../../../../app/constants'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import TemplateSelect from '../../../../components/inputs/template-select/TemplateSelect'
import { getDeepestChildLevel } from '../../../../services/helpers/task/task-util-helper'
import { flatTaskListFromTree } from '../../../../services/task/data-provider/task-list-data-provider'
import templateService from '../../../../services/template/template-service'
import TaskMoveTaskSelect, {
  getValidTargetTasks,
} from '../../../task-details/task-options/task-move/task-move-dialog/task-select/TaskMoveTaskSelect'
import { DestinationMenu } from '../../../task-details/task-options/task-move/task-move-dialog/TaskMoveDestinationMenu'
import { TASK_OPERATION_DESTINATION } from '../../../task-details/task-options/task-move/task-move-dialog/TaskOperationDestinationTypeDefinitions'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  destinationMenu: {
    color: theme.palette.text.secondary,
    width: '100%',
  },
  destinationField: {
    display: 'inline-block',
    width: '100%',
  },
  destinationSelection: {
    width: `calc(100% - ${theme.spacing(3)})`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.spacing(7),
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  destinationMoveLabel: {
    display: 'inline-block',
    marginTop: -2.2,
    minWidth: theme.spacing(16),
  },
  destinationMovePadding: {
    display: 'inline-block',
    paddingLeft: theme.spacing(16),
  },
}))

const styleEmpty = {}
const styleDialog = { width: DESKTOP_DIALOG_WIDTH }

/** Dialog to handle moving Template Task within a template. */
const MoveTemplateTaskDialog = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [otherTemplateSelectedMoveType, setOtherTemplateSelectedMoveType] =
    useState('')

  const [selectedMoveType, setSelectedMoveType] = useState('')
  const [selectedItemDestination, setSelectedItemDestination] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedTemplateTasks, setSelectedTemplateTasks] = useState(undefined)
  const [taskValidationMessage, setTaskValidationMessage] = useState('')
  const [otherTaskValidationMessage, setOtherTaskValidationMessage] =
    useState('')
  const [destinationSelectErrorMessage, setDestinationSelectErrorMessage] =
    useState(false)
  const [moveToDestinationErrorMessage, setMoveToDestinationErrorMessage] =
    useState(false)
  const [
    destinationSelectErrorOtherTemplateMessage,
    setDestinationSelectErrorOtherTemplateMessage,
  ] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [showLoadingBar, setShowLoadingBar] = useState(false)

  const {
    task,
    template,
    templateTasks,
    taskMenuContext,
    handleMove,
    cancelHandler,
    levelAProjectTaskCountCheck,
    fullScreen,
  } = props

  const checkParentChildCountAtCapacity = task => {
    return task.tasks.length === CONFIG.LEVEL_A_TASK_LIMIT
  }

  const checkTaskDepthCapacity = t => {
    const childrenLevel = getDeepestChildLevel(task) - t.level + 1
    return childrenLevel + t.level > 6
  }

  const checkLevelALimitBasedOnContext = () => {
    return levelAProjectTaskCountCheck(
      taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP
        ? { tasks: templateTasks }
        : template
    )
  }
  const handleDestinationTypeChange = event => {
    setSelectedMoveType(event.target.value)
    setDestinationSelectErrorMessage(false)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')

    if (
      event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A &&
      checkLevelALimitBasedOnContext()
    ) {
      setTaskValidationMessage(
        t('commonValidationMessages.levelATaskLimitTemplate', {
          limit: CONFIG.LEVEL_A_TASK_LIMIT,
        })
      )
      setDestinationSelectErrorMessage(true)
    }
  }

  const handleOtherTemplateDestinationTypeChange = event => {
    setOtherTemplateSelectedMoveType(event.target.value)
    setDestinationSelectErrorMessage(false)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setOtherTaskValidationMessage('')
    setDestinationSelectErrorOtherTemplateMessage(
      event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A &&
        levelAProjectTaskCountCheck(selectedTemplateTasks)
        ? true
        : false
    )

    if (
      event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A &&
      levelAProjectTaskCountCheck(selectedTemplateTasks)
    ) {
      setOtherTaskValidationMessage(
        t('commonValidationMessages.levelATaskLimitTemplate', {
          limit: CONFIG.LEVEL_A_TASK_LIMIT,
        })
      )
      setDestinationSelectErrorOtherTemplateMessage(true)
    }
  }

  const handleTemplateChange = template => {
    setSelectedTemplateId(template.id)
    setSelectedItemDestination(undefined)

    if (template.id) {
      templateService.getTemplate(template.id).then(response => {
        if (response.status === StatusCodes.OK) {
          setSelectedTemplateTasks(response.body)
        }
      })
    }
  }

  const renderTemplateSelection = () => {
    return (
      <>
        <FormControl style={{ width: '71%', marginLeft: '128px' }}>
          <TemplateSelect
            key={selectedTemplateId}
            selectionChangeHandler={handleTemplateChange}
            templateId={selectedTemplateId}
            placeholder={t('copyTaskDialog.chooseATemplate')}
            templatesToExclude={[{ id: template.id }]}
            handleCreateTaskTemplateLevelAValidation={
              props.levelATaskValidation
            }
          />
        </FormControl>
      </>
    )
  }

  const renderOtherTemplateOptions = () => {
    return (
      <>
        <FormControl
          style={{ width: '70%', marginLeft: 'auto', marginRight: '24px' }}
          className={classes.destinationSelection}
          error={destinationSelectErrorOtherTemplateMessage}
        >
          <div className={classes.destinationField}>
            <DestinationMenu
              selectedMoveType={otherTemplateSelectedMoveType}
              handleChange={handleOtherTemplateDestinationTypeChange}
              root={classes.destinationMenu}
              hideProject={true}
              allowMoveToPhase={true}
            />
            {renderValidationMessage(otherTaskValidationMessage)}
          </div>
        </FormControl>
      </>
    )
  }

  const renderTaskMoveSelection = () => {
    return (
      <FormControl
        className={classes.destinationSelection}
        error={destinationSelectErrorMessage}
      >
        <Typography
          className={classes.destinationMoveLabel}
          variant="subtitle1"
          data-test="destination-select-label"
        >
          {t('taskMove.moveTaskTo')}
        </Typography>
        <div className={classes.destinationField}>
          <DestinationMenu
            selectedMoveType={selectedMoveType}
            handleChange={handleDestinationTypeChange}
            root={classes.destinationMenu}
            isTemplate={true}
            allowMoveToPhase={task.level !== 1}
          />
          {selectedMoveType !== TASK_OPERATION_DESTINATION.ANOTHER_PROJECT &&
          selectedMoveType !==
            TASK_OPERATION_DESTINATION.ANOTHER_PROJECT_SUBTASK
            ? renderValidationMessage(taskValidationMessage)
            : ''}
        </div>
      </FormControl>
    )
  }

  const handleTemplateTaskChange = templateTask => {
    setSelectedTaskId(templateTask.id)
    setSelectedItemDestination(templateTask.id)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setShowLoadingBar(false)

    handleMoveToSubtaskValidation(templateTask)
  }

  const handleAction = () => {
    setShowLoadingBar(true)

    if (selectedMoveType === '') {
      setDestinationSelectErrorMessage(true)
      setShowLoadingBar(false)
    } else if (
      selectedMoveType === TASK_OPERATION_DESTINATION.SUBTASK_OF &&
      selectedItemDestination.length === 0
    ) {
      setMoveToDestinationErrorMessage(true)
      setShowLoadingBar(false)
    } else if (
      selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT
    ) {
      const destinationParent =
        otherTemplateSelectedMoveType === TASK_OPERATION_DESTINATION.LEVEL_A
          ? selectedTemplateId
          : selectedItemDestination
      const destinationType =
        otherTemplateSelectedMoveType !== TASK_OPERATION_DESTINATION.LEVEL_A
          ? TASK_OPERATION_DESTINATION.ANOTHER_PROJECT_SUBTASK
          : otherTemplateSelectedMoveType
      handleMove(destinationType, destinationParent)
    } else {
      const destinationParent =
        selectedMoveType === TASK_OPERATION_DESTINATION.LEVEL_A
          ? template.id
          : selectedItemDestination

      handleMove(selectedMoveType, destinationParent)
    }
  }

  const handleMoveToSubtaskValidation = task => {
    let validationMessage = ''
    let error = false
    if (task.tasks.length === CONFIG.SUBTASK_LIMIT) {
      validationMessage = t('commonValidationMessages.taskSubtaskLimit', {
        limit: CONFIG.SUBTASK_LIMIT,
      })
      error = true
    } else if (checkTaskDepthCapacity(task)) {
      validationMessage = t('commonValidationMessages.taskDepthLimit')
      error = true
    } else if (checkParentChildCountAtCapacity(task)) {
      validationMessage = 'Parent task has 8 subtasks' //should not ever be hit
      error = true
    }

    setTaskValidationMessage(validationMessage)
    setMoveToDestinationErrorMessage(error)
  }

  const renderTaskSelection = () => {
    if (selectedMoveType === TASK_OPERATION_DESTINATION.SUBTASK_OF) {
      return (
        <FormControl
          className={classes.destinationSelection}
          error={moveToDestinationErrorMessage}
        >
          <div
            className={classNames(classes.destinationField, {
              [classes.destinationMovePadding]: !props.fullScreen,
            })}
          >
            <TaskMoveTaskSelect
              selectedTask={task}
              validTargetTasks={getValidTargetTasks(
                task,
                taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP
                  ? { tasks: templateTasks }
                  : template
              )}
              error={moveToDestinationErrorMessage}
              selectionChangeHandler={handleTemplateTaskChange}
              placeholderText={t('templates.chooseATemplateTask')}
            />
            {renderDestinationValidationMessage()}
          </div>
        </FormControl>
      )
    }
  }

  const renderOtherTemplateTaskSelect = () => {
    return (
      <FormControl
        className={classes.destinationSelection}
        error={moveToDestinationErrorMessage}
      >
        <div
          className={classNames(classes.destinationField, {
            [classes.destinationMovePadding]: !props.fullScreen,
          })}
        >
          <TaskMoveTaskSelect
            selectedTask={task}
            validTargetTasks={flatTaskListFromTree(selectedTemplateTasks)}
            error={moveToDestinationErrorMessage}
            selectionChangeHandler={handleTemplateTaskChange}
            placeholderText={t('templates.chooseATemplateTask')}
          />
          {renderDestinationValidationMessage()}
        </div>
      </FormControl>
    )
  }

  const isMoveButtonDisabled = () =>
    destinationSelectErrorMessage ||
    moveToDestinationErrorMessage ||
    destinationSelectErrorOtherTemplateMessage

  const renderValidationMessage = () =>
    destinationSelectErrorMessage || otherTaskValidationMessage
      ? fieldValidationMessage()
      : null

  const renderDestinationValidationMessage = () => {
    if (moveToDestinationErrorMessage || taskValidationMessage) {
      return fieldValidationMessage()
    }
  }

  const fieldValidationMessage = () => (
    <FormHelperText data-test="move-dialog-validation-message">
      {taskValidationMessage.length > 0
        ? taskValidationMessage
        : otherTaskValidationMessage.length > 0
          ? otherTaskValidationMessage
          : t('commonValidationMessages.requiredField')}
    </FormHelperText>
  )

  return (
    <JuralioDialog
      open={true}
      onClose={cancelHandler}
      fullScreen={fullScreen}
      titleText={t('taskMove.titleWithTaskName', {
        taskName: task.name,
      })}
      titleIcon={MoveIcon}
      handleAction={handleAction}
      handleCancel={cancelHandler}
      actionLabel={t('common.move')}
      disabled={isMoveButtonDisabled()}
      showLoadingBar={showLoadingBar}
      loadingText={t('taskMove.loadingText')}
      context={selectedMoveType}
    >
      <DialogContent style={fullScreen ? styleEmpty : styleDialog}>
        {renderTaskMoveSelection()}
        {selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT &&
          renderTemplateSelection()}
        {selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT &&
          selectedTemplateId !== '' &&
          renderOtherTemplateOptions()}
        {selectedMoveType === TASK_OPERATION_DESTINATION.SUBTASK_OF &&
        selectedTemplateId === ''
          ? renderTaskSelection()
          : null}
        {otherTemplateSelectedMoveType ===
          TASK_OPERATION_DESTINATION.SUBTASK_OF &&
          renderOtherTemplateTaskSelect()}
      </DialogContent>
    </JuralioDialog>
  )
}

export default MoveTemplateTaskDialog
