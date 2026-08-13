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
import ErrorIcon from '@mui/icons-material/Error'
import AlertIcon from '@mui/icons-material/ReportProblem'
import { Typography } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../../components/dialog/juralio-dialog/JuralioDialog'
import BigDataSpinner from '../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import WorkstreamSelect from '../../../../../components/inputs/workstream-select/WorkstreamSelect'
import { getTaskMapUrl } from '../../../../../components/navigation/common/location-context-helper'
import projectService from '../../../../../services/project/project-service'
import { flatTaskListFromTree } from '../../../../../services/task/data-provider/task-list-data-provider'
import juralioColours from '../../../../../theme/juralio-colours'
import {
  APP_CONTEXT,
  CONFIG,
  DESKTOP_DIALOG_WIDTH,
  TASK_MENU_CONTEXT,
} from '../../../../constants'
import { displayConfirmationDialog } from '../../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import TaskMoveTaskSelect, {
  getValidTargetTasks,
} from './task-select/TaskMoveTaskSelect'
import { DestinationMenu } from './TaskMoveDestinationMenu'
import { taskMoveKnockOnDialog } from './TaskMoveKnockOnDialog'
import { TASK_OPERATION_DESTINATION } from './TaskOperationDestinationTypeDefinitions'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

const useStyles = makeStyles()(theme => ({
  root: {
    color: theme.palette.text.secondary,
  },
  destinationMenu: {
    color: theme.palette.text.secondary,
    width: '100%',
  },
  destinationSelection: {
    width: `calc(100% - ${theme.spacing(3)})`,
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  projectDestinationSelection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  destinationMoveLabel: {
    paddingTop: theme.spacing(0.35),
    display: 'inline-block',
    minWidth: theme.spacing(16),
  },
  destinationField: {
    display: 'inline-block',
    width: '100%',
  },
  dropDownContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  taskTypeDropDown: {
    paddingTop: theme.spacing(4),
    width: '100%',
    paddingRight: '0 !important',
  },
  error: {
    color: juralioColours.error,
  },
  errorMessage: {
    display: 'flex',
    paddingTop: theme.spacing(1),
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
  linkAlertWrapper: {
    display: 'flex',
    left: theme.spacing(5),
    top: theme.spacing(51.25),
    position: 'absolute',
  },
  alertIcon: {
    color: juralioColours.alert,
    alignSelf: 'center',
    marginRight: theme.spacing(1),
  },
}))

/** Dialog to handle moving Task within and between projects. */
const TaskMoveDialog = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()

  const { task, taskMenuContext, matterId } = props

  const project = useSelector(state => state.project)
  const projects = useSelector(state => state.projects.items)
  const error = useSelector(state => state.taskOperation.error)

  const [selectedMoveType, setSelectedMoveType] = useState('')

  const [postError, setPostError] = useState('')
  const [selectedMoveTypeAnotherProject, setSelectedMoveTypeAnotherProject] =
    useState('')
  const [selectedItemDestination, setSelectedItemDestination] = useState('')
  const [selectedProjectDestination, setSelectedProjectDestination] =
    useState(undefined)
  const [taskValidationMessage, setTaskValidationMessage] = useState('')
  const [destinationSelectErrorMessage, setDestinationSelectErrorMessage] =
    useState(false)
  const [moveToDestinationErrorMessage, setMoveToDestinationErrorMessage] =
    useState(false)
  const [moveToProjectErrorMessage, setMoveToProjectErrorMessage] =
    useState(false)
  const [
    moveToProjectDestinationErrorMessage,
    setMoveToProjectDestinationErrorMessage,
  ] = useState(false)
  const [targetTasks, setTargetTasks] = useState(undefined)
  const [showLoadingBar, setShowLoadingBar] = useState(false)

  const handleClose = () => {
    props.cancelHandler()
  }

  const handleAction = (parent, maintainTaskConsistency = false) => {
    setShowLoadingBar(true)

    if (selectedMoveType === '') {
      setDestinationSelectErrorMessage(true)
      setShowLoadingBar(false)
    }

    if (
      selectedMoveType === TASK_OPERATION_DESTINATION.SUBTASK_OF &&
      selectedItemDestination.length === 0
    ) {
      setMoveToDestinationErrorMessage(true)
      setShowLoadingBar(false)
    }

    if (selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT) {
      if (!selectedProjectDestination) {
        setMoveToProjectErrorMessage(true)
        setShowLoadingBar(false)
      }
      if (!selectedMoveTypeAnotherProject) {
        setMoveToProjectDestinationErrorMessage(true)
        setShowLoadingBar(false)
      }
      if (
        selectedMoveTypeAnotherProject === APP_CONTEXT.TASK &&
        selectedItemDestination.length === 0
      ) {
        setMoveToDestinationErrorMessage(true)
        setShowLoadingBar(false)
      }
      if (
        selectedProjectDestination.tasks.filter(t => t.level === 1).length ===
        16
      ) {
        setMoveToProjectDestinationErrorMessage(true)
        setShowLoadingBar(false)
      }
    }

    moveTask(
      selectedMoveType,
      getDestinationProjectId(),
      selectedItemDestination,
      maintainTaskConsistency
    ).then(res => {
      if (res && res.type && res.type === 'MOVE_TASK_KNOCK_ON_EFFECTS') {
        if (
          getDestinationProjectId() !== project.id &&
          getDestinationProjectId() !== undefined
        ) {
          projectService
            .getProjectTasks(matterId, getDestinationProjectId())
            .then(otherProjectRes => {
              taskMoveKnockOnDialog(
                res.knockOnEffects,
                task,
                otherProjectRes.body,
                t,
                () => {
                  handleAction(parent, true)
                },
                handleClose,
                displayConfirmationDialog,
                false,
                dispatch
              )
            })
        } else {
          taskMoveKnockOnDialog(
            res.knockOnEffects,
            task,
            flatTaskListFromTree(project),
            t,
            () => {
              handleAction(parent, true)
            },
            handleClose,
            displayConfirmationDialog,
            false,
            dispatch
          )
        }
      } else {
        if (error === '' && res?.type !== 'MOVE_TASK_FAILURE') {
          if (taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL) {
            if (task.level > 1) {
              return props.fetchTaskDetails(
                matterId,
                task.projectId,
                task.parent.id
              )
            } else {
              return props.fetchProjectOverview(matterId, task.projectId)
            }
          } else if (
            selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT
          ) {
            history(
              getTaskMapUrl(task.id, matterId, selectedProjectDestination.id)
            )
            handleClose()
            props.updateProject(matterId, task.projectId)
            return
          } else {
            history(getTaskMapUrl(task.id, matterId, task.projectId))
          }
          handleClose()
          props.updateProject(matterId, task.projectId)
        }
      }
    })
  }

  const getDestinationProjectId = () => {
    return selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT
      ? selectedProjectDestination.id
      : undefined
  }

  const moveTask = (
    destination,
    destinationProjectId,
    destinationParentId,
    maintainTaskConsistency
  ) => {
    return props.moveHandler(
      matterId,
      task.projectId,
      task.id,
      destination,
      destinationProjectId,
      destinationParentId,
      task.status,
      taskMenuContext !== TASK_MENU_CONTEXT.SUBTASK_PANEL,
      maintainTaskConsistency
    )
  }

  const handleDestinationTypeChangeForAnotherProject = event => {
    props.clearMoveTaskError()
    setSelectedMoveTypeAnotherProject(event.target.value)
    setDestinationSelectErrorMessage(false)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setSelectedItemDestination('')
    setMoveToProjectDestinationErrorMessage(false)

    if (event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A) {
      setSelectedItemDestination(0)
    }
  }

  const handleDestinationTypeChange = event => {
    props.clearMoveTaskError()
    setSelectedProjectDestination(undefined)
    setSelectedMoveType(event.target.value)
    setDestinationSelectErrorMessage(false)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setSelectedItemDestination('')

    if (
      event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A &&
      props.levelAProjectTaskCountCheck(project)
    ) {
      setTaskValidationMessage(
        t('commonValidationMessages.levelATaskLimit', {
          limit: CONFIG.LEVEL_A_TASK_LIMIT,
        })
      )
      setDestinationSelectErrorMessage(true)
    }

    if (event.target.value === TASK_OPERATION_DESTINATION.LEVEL_A) {
      setSelectedItemDestination(0)
    }
  }

  const handleProjectChange = selectedValue => {
    props.clearMoveTaskError()
    setSelectedProjectDestination(selectedValue)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setMoveToProjectErrorMessage(false)
    setMoveToProjectDestinationErrorMessage(false)

    const projectsTasks = projects.filter(p => p.id === selectedValue.id)
    if (projectsTasks.length > 0) {
      setTargetTasks(projectsTasks[0].tasks)
    }
  }

  const handleTaskChangeAnotherProject = selectedValue => {
    props.clearMoveTaskError()
    setSelectedItemDestination(selectedValue.id)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setMoveToProjectErrorMessage(false)
    setMoveToProjectDestinationErrorMessage(false)
  }

  const handleTaskChange = selectedValue => {
    props.clearMoveTaskError()
    setSelectedItemDestination(selectedValue.id)
    setMoveToDestinationErrorMessage(false)
    setTaskValidationMessage('')
    setMoveToProjectErrorMessage(false)
    setMoveToProjectDestinationErrorMessage(false)

    handleMoveTaskValidation(selectedValue)
  }

  const handleMoveTaskValidation = task => {
    let validationMessage = ''
    let error = false

    if (task.tasks.length === CONFIG.SUBTASK_LIMIT) {
      validationMessage = t('commonValidationMessages.taskSubtaskLimit', {
        limit: CONFIG.SUBTASK_LIMIT,
      })
      error = true
    }

    setTaskValidationMessage(validationMessage)
    setMoveToDestinationErrorMessage(error)
  }

  const renderTaskSelection = () => {
    if (selectedMoveType === TASK_OPERATION_DESTINATION.SUBTASK_OF) {
      return (
        <FormControl error={moveToDestinationErrorMessage}>
          <div
            className={classNames(classes.destinationField, {
              [classes.destinationMovePadding]: !props.fullScreen,
            })}
          >
            <TaskMoveTaskSelect
              selectedTask={task}
              validTargetTasks={getValidTargetTasks(task, project)}
              error={moveToDestinationErrorMessage}
              selectionChangeHandler={handleTaskChange}
              placeholderText={t('taskMove.enterNameOfTask')}
            />
            {renderDestinationValidationMessage()}
          </div>
        </FormControl>
      )
    }
  }

  const renderProjectSelection = () => {
    if (selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT) {
      return (
        <React.Fragment>
          <div
            className={classNames(classes.destinationField, {
              [classes.destinationMovePadding]: !props.fullScreen,
            })}
          >
            <WorkstreamSelect
              matterId={parseInt(matterId)}
              error={moveToProjectErrorMessage}
              isMove={true}
              selectionChangeHandler={handleProjectChange}
              excludedProject={project}
              placeholder={t('taskMove.enterNameOfProject')}
              projectId={
                selectedProjectDestination
                  ? selectedProjectDestination.id
                  : null
              }
              selectFirstProject={false}
            />
          </div>
          <FormControl
            className={classes.projectDestinationSelection}
            error={moveToProjectDestinationErrorMessage}
          >
            {selectedProjectDestination && (
              <div className={classes.taskTypeDropDown}>
                <DestinationMenu
                  selectedMoveType={selectedMoveTypeAnotherProject}
                  handleChange={handleDestinationTypeChangeForAnotherProject}
                  root={classes.destinationMenu}
                  hideProject={true}
                  allowMoveToPhase={true}
                />
              </div>
            )}
          </FormControl>
          {selectedMoveTypeAnotherProject === APP_CONTEXT.TASK && (
            <TaskMoveTaskSelect
              selectedTask={task}
              validTargetTasks={targetTasks}
              error={moveToDestinationErrorMessage}
              selectionChangeHandler={handleTaskChangeAnotherProject}
              placeholderText={t('taskMove.enterNameOfTask')}
            />
          )}
          {renderProjectDestinationValidationMessage()}
        </React.Fragment>
      )
    }
  }

  const renderProjectDestinationValidationMessage = () => {
    if (
      moveToProjectErrorMessage ||
      moveToProjectDestinationErrorMessage ||
      moveToDestinationErrorMessage
    ) {
      return fieldValidationMessage()
    }
  }

  const renderValidationMessage = () => {
    if (destinationSelectErrorMessage) {
      return fieldValidationMessage()
    }
  }

  const renderDestinationValidationMessage = () => {
    if (moveToDestinationErrorMessage || taskValidationMessage) {
      return fieldValidationMessage()
    }
  }

  const fieldValidationMessage = () => {
    return (
      <FormHelperText data-test="move-dialog-validation-message">
        {taskValidationMessage.length > 0
          ? taskValidationMessage
          : t('commonValidationMessages.requiredField')}
      </FormHelperText>
    )
  }

  const isMoveButtonDisabled = () =>
    destinationSelectErrorMessage ||
    moveToDestinationErrorMessage ||
    moveToProjectErrorMessage ||
    selectedMoveType === '' ||
    (selectedMoveType === TASK_OPERATION_DESTINATION.ANOTHER_PROJECT &&
      selectedMoveTypeAnotherProject === '')

  const isThereAnotherActiveStream = () => {
    let ps = projects.filter(p => p.active)
    return ps?.length > 1
  }

  const generatePostCount = (task, counter) => {
    if (task.posts) {
      counter = counter + task.posts.length
    }
    if (task.tasks) {
      task.tasks.forEach(t => {
        counter = generatePostCount(t, counter)
      })
    }
    return counter
  }

  useEffect(() => {
    let destinationPostCount = 0
    let selectedTaskPostCount = 0
    selectedProjectDestination?.tasks.forEach(t => {
      if (t.posts) {
        destinationPostCount = destinationPostCount + t.posts.length
      }
    })
    if (destinationPostCount + selectedTaskPostCount >= CONFIG.POSTS_LIMIT) {
      setPostError('Maximum number of posts reached in the workstream')
    } else {
      setPostError('')
    }
  }, [selectedItemDestination, selectedProjectDestination, selectedMoveType])

  return (
    <JuralioDialog
      open={true}
      className={classes.root}
      onClose={handleClose}
      fullScreen={props.fullScreen}
      titleText={t('taskMove.titleWithTaskName', {
        taskName: task.name,
      })}
      titleIcon={MoveIcon}
      handleAction={handleAction}
      handleCancel={handleClose}
      actionLabel={t('common.move')}
      disabled={isMoveButtonDisabled()}
      showLoadingBar={error === '' && showLoadingBar}
      loadingText={t('taskMove.loadingText')}
    >
      <DialogContent
        style={props.fullScreen ? {} : { width: DESKTOP_DIALOG_WIDTH }}
      >
        {project.isLoaded ? (
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
            <div className={classes.dropDownContainer}>
              <DestinationMenu
                selectedMoveType={selectedMoveType}
                handleChange={handleDestinationTypeChange}
                root={classes.destinationMenu}
                hideProject={!isThereAnotherActiveStream()}
                allowMoveToPhase={task.level !== 1}
              />
              {renderTaskSelection()}
              {renderProjectSelection()}
              {renderValidationMessage()}
              {(error !== '' || postError !== '') && (
                <FormHelperText
                  className={classes.errorMessage}
                  data-test="task-move-error"
                >
                  <ErrorIcon fontSize="small" className={classes.errorIcon} />
                  <Typography className={classes.error}>
                    {error ? error : postError}
                  </Typography>
                </FormHelperText>
              )}
            </div>
          </FormControl>
        ) : (
          <BigDataSpinner size={20} />
        )}
        {task.datesLinkedToSiblings && (
          <div className={classes.linkAlertWrapper}>
            <AlertIcon className={classes.alertIcon} />
            <Typography>{t('taskLinking.linkAlert')}</Typography>
          </div>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

TaskMoveDialog.propTypes = {
  /** The Task to be moved.*/
  task: PropTypes.object.isRequired,
  /** Function to call when dialog cancelled.*/
  cancelHandler: PropTypes.func.isRequired,
  /** Function to call when move button pressed.*/
  moveHandler: PropTypes.func.isRequired,
  /** Id of the current Matter*/
  matterId: PropTypes.string.isRequired,
  /** Project (as object) of the task being moved (prop set from Redux). */
  project: PropTypes.object.isRequired,
  /** Level A task count validator */
  levelAProjectTaskCountCheck: PropTypes.func.isRequired,
  /** Flag for mobile display */
  fullScreen: PropTypes.bool.isRequired,
}

export default TaskMoveDialog
