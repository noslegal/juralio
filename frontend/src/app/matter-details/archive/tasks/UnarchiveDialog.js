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

import { FormControl, RadioGroup, useMediaQuery, useTheme } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import ErrorBox from '../../../../components/data-display/error-box/ErrorBox'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import taskService from '../../../../services/task/task-service'
import juralioColours from '../../../../theme/juralio-colours'
import { MattersIcon } from '../../../../theme/navigation/CommonIcons'
import { APP_CONTEXT, CONFIG } from '../../../constants'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { taskMoveKnockOnDialog } from '../../../task-details/task-options/task-move/task-move-dialog/TaskMoveKnockOnDialog'
import {
  fetchProjects,
  fetchProjectWithTasks,
} from '../../projects/projects-actions'
import NewLocationOption from './NewLocationOption'
import PreviousLocationOption from './PreviousLocationOption'
import {
  clearFormValidation,
  clearKnockOnEffects,
  getArchivedTasks,
  unarchiveTask,
} from './task-archive-actions'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
  },
  radioText: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    paddingBottom: theme.spacing(4),
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
    paddingBottom: theme.spacing(1),
  },
  previousLocation: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousLocationSub: {
    paddingRight: theme.spacing(1),
  },
  newLocation: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  selectLabel: {
    flex: 1,
    paddingTop: theme.spacing(3),
  },
  selects: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    paddingBottom: theme.spacing(1),
    width: '280px', // Fixes weird select growing bug
  },
  selectMiddle: {
    paddingTop: theme.spacing(1),
  },
  label: {
    width: '100% !important',
  },
  unrecorded: {
    color: juralioColours.error,
  },
}))

const UnarchiveDialog = props => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { task, matterId, handleClose } = props
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [selectedMoveType, setSelectedMoveType] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [targetTasks, setTargetTasks] = useState()
  const [attempt, setAttempt] = useState(0)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const unarchiveDialogError = useSelector(
    state => state.taskArchive.unarchive.error
  )
  const knockOnEffects = useSelector(state => state.taskArchive.knockOnEffects)
  const [selectedProject, setSelectedProject] = useState()
  const { t } = useTranslation()
  const radioPreviousLocation = t('unarchiveDialog.radioPreviousLocation')
  const radioNewLocation = t('unarchiveDialog.radioNewLocation')
  const [newLocationDisabled, setNewLocationDisabled] = useState(false)
  const NEW_LOCATION = radioNewLocation
  const PREVIOUS_LOCATION = radioPreviousLocation
  const [selectedLocation, setSelectedLocation] = useState(PREVIOUS_LOCATION)
  const handleLocationChange = event => {
    setSelectedLocation(event.target.value)

    setSelectedProject()
    setSelectedMoveType('')
    setSelectedTask('')
    setHelperText('')
    setShowLoadingBar(false)
  }
  const [helperText, setHelperText] = useState('')
  const projects = useSelector(state => state.projects.items)

  useEffect(() => {
    dispatch(fetchProjects(matterId))
    dispatch(clearFormValidation())
    dispatch(fetchProjectWithTasks(matterId, false, false, false))
  }, [dispatch, matterId])

  useEffect(() => {
    if (!task.restoreToParentName) {
      setSelectedLocation(NEW_LOCATION)
      setNewLocationDisabled(true)
    }
  }, [NEW_LOCATION, task])

  useEffect(() => {
    if (unarchiveDialogError === false) {
      setHelperText('')
      handleClose()
    } else if (unarchiveDialogError) {
      setHelperText(unarchiveDialogError)
      setShowLoadingBar(false)
    }
  }, [handleClose, t, unarchiveDialogError])

  const closeDialog = () => {
    dispatch(clearFormValidation())
    handleClose()
  }

  const handleDestinationTypeChange = event => {
    setHelperText('')

    const destinationType = event.target.value

    if (destinationType === APP_CONTEXT.PROJECT) {
      setSelectedTask(0) // Treated as Level A
    }
    setSelectedMoveType(destinationType)
  }

  const handleTaskChange = selectedValue => {
    setHelperText('')
    setSelectedTask(selectedValue.id)
  }

  const handleProjectChange = selectedValue => {
    setHelperText('')
    setSelectedProject(selectedValue.id)
    const projectsTasks = projects.filter(p => p.id === selectedValue.id)
    if (projectsTasks.length > 0) setTargetTasks(projectsTasks[0].tasks)
  }

  const handleAction = () => {
    setShowLoadingBar(true)
    handleUnarchiveTask()
  }

  const handleUnarchiveTask = (maintainTaskConsistency = false) => {
    dispatch(
      unarchiveTask(
        props.matterId,
        props.task.projectId,
        props.task.id,
        selectedProject,
        selectedTask,
        selectedMoveType,
        matterId,
        selectedProject ? selectedProject : props.task.restoreToProjectId,
        props.task.id,
        maintainTaskConsistency
      )
    )
      .then(() => dispatch(getArchivedTasks(props.matterId)))
      .then(() => (attempt === 0 ? setAttempt(1) : setAttempt(0)))
  }

  const restoreDisable = () => {
    if (helperText !== '') {
      return true
    }
    //if first radio is selected
    if (selectedLocation === PREVIOUS_LOCATION) {
      return false
    }
    //if second radio is selected and level A task is selected
    else if (
      selectedLocation === NEW_LOCATION &&
      selectedMoveType === APP_CONTEXT.PROJECT
    ) {
      return false
    }
    //if second radio is selected subtask was selected and a subtask is selected
    else if (
      selectedLocation === NEW_LOCATION &&
      selectedMoveType === APP_CONTEXT.TASK &&
      selectedTask !== 0
    ) {
      return false
    }
    //disable the button
    else {
      return true
    }
  }

  let getKnockOnEffectsContent = () => {
    let tasks = taskService.getTasks(
      props.matterId,
      selectedProject ? selectedProject : props.task.restoreToProjectId,
      ''
    )
    tasks.promise.then(response => {
      let projectTasks = response.body
      let task = props.task
      return taskMoveKnockOnDialog(
        knockOnEffects,
        task,
        projectTasks,
        t,
        () => {
          dispatch(clearKnockOnEffects())
          handleUnarchiveTask(true)
        },
        () => {
          closeDialog()
          dispatch(clearKnockOnEffects())
        },
        (options, callback) => {
          dispatch(displayConfirmationDialog(options, callback))
        },
        true
      )
    })
  }

  const generatePostCount = (task, counter) => {
    if (task.postCount) {
      counter = counter + task.postCount
    }
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
    let taskTreePostCount = 0
    let projectPostCount = 0
    taskTreePostCount = generatePostCount(task, taskTreePostCount)
    if (projects.length > 0) {
      if (selectedLocation === PREVIOUS_LOCATION) {
        projectPostCount = projects.find(
          p => p.id === parseInt(task.restoreToProjectId)
        ).postCount
      } else if (selectedLocation === NEW_LOCATION) {
        if (selectedProject) {
          projectPostCount = projects.find(
            p => p.id === selectedProject
          ).postCount
        }
      }
    }

    if (taskTreePostCount + projectPostCount > CONFIG.POSTS_LIMIT) {
      setHelperText(t('postArchive.restoreDialog.maxPosts'))
    }
    //eslint-disable-next-line
  }, [projects, selectedLocation, selectedProject])

  return (
    <JuralioDialog
      disabled={restoreDisable()}
      open={true}
      titleText={t('unarchiveDialog.titleText')}
      titleIcon={MattersIcon}
      handleCancel={closeDialog}
      actionLabel={t('unarchiveDialog.button')}
      context={attempt}
      handleAction={handleAction}
      onClose={closeDialog}
      fullScreen={isMobileView}
      showLoadingBar={showLoadingBar}
      loadingText={t('unarchiveDialog.loadingText')}
    >
      <DialogContent data-test="dialog-content">
        <FormControl error={unarchiveDialogError} className={classes.root}>
          <RadioGroup>
            <PreviousLocationOption
              classes={classes}
              PREVIOUS_LOCATION={PREVIOUS_LOCATION}
              handleLocationChange={handleLocationChange}
              newLocationDisabled={newLocationDisabled}
              selectedLocation={selectedLocation}
              task={task}
            />
            <NewLocationOption
              classes={classes}
              NEW_LOCATION={NEW_LOCATION}
              handleLocationChange={handleLocationChange}
              selectedLocation={selectedLocation}
              matterId={parseInt(matterId)}
              selectedProject={selectedProject}
              selectedMoveType={selectedMoveType}
              handleProjectChange={handleProjectChange}
              handleDestinationTypeChange={handleDestinationTypeChange}
              selectedTask={selectedTask}
              targetTasks={targetTasks}
              handleTaskChange={handleTaskChange}
            />
            {helperText !== '' && <ErrorBox error={helperText} />}
          </RadioGroup>
        </FormControl>
        {knockOnEffects && getKnockOnEffectsContent()}
      </DialogContent>
    </JuralioDialog>
  )
}

export default UnarchiveDialog
