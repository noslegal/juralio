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

import { mdiArchive } from '@mdi/js'
import { FormControl, RadioGroup, useMediaQuery, useTheme } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../../components/dialog/juralio-dialog/JuralioDialog'
import { fetchProjectWithTasks } from '../../../projects/projects-actions'
import {
  hideRestorePostDialog,
  restorePost,
} from '../task-post-archive-actions'
import NewLocationPostOption from './NewLocationPostOption'
import PreviousPostLocation from './PreviousPostLocation'
import { CONFIG } from '../../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
  },
}))

const PostRestoreDialog = props => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const closeDialog = () => dispatch(hideRestorePostDialog())
  const [restoreType, setRestoreType] = useState('previousLocation')
  const [selectedProject, setSelectedProject] = useState()
  const [targetTasks, setTargetTasks] = useState()
  const [selectedTask, setSelectedTask] = useState('')
  const [disableDialog, setDisableDialog] = useState(false)
  const [disableDialogPrevLocation, setDisableDialogPrevLocation] =
    useState(false)
  const post = useSelector(state => state.postArchive.restore.post)
  const [isActivelyRestoring, setIsActivelyRestoring] = useState(false)
  const projects = useSelector(state => state.projects.items)

  useEffect(() => {
    dispatch(fetchProjectWithTasks(props.matter.id, false, false, false))
  }, [dispatch, props.matter.id])

  useEffect(() => {
    if (restoreType === 'previousLocation') {
      if (
        projects.length > 0 &&
        projects?.filter(p => p.id === post.projectWhenArchivedId)[0]
          .postCount >= CONFIG.POSTS_LIMIT
      ) {
        setDisableDialogPrevLocation(true)
      }
    } else {
      if (
        projects.length > 0 &&
        projects?.filter(p => p.id === selectedProject)[0]?.postCount >=
          CONFIG.POSTS_LIMIT
      ) {
        setDisableDialog(true)
      }
    }
    //eslint-disable-next-line
  }, [projects, restoreType, selectedProject, selectedTask])

  const handleRestoreTypeChange = e => {
    setSelectedProject()
    setSelectedTask()
    setRestoreType(e.target.value)
  }

  const handleProjectChange = selectedValue => {
    setSelectedProject(selectedValue.id)
    const projectsTasks = projects.filter(p => p.id === selectedValue.id)
    if (projectsTasks.length > 0) setTargetTasks(projectsTasks[0].tasks)
  }

  const handleTaskChange = selectedValue => {
    setSelectedTask(selectedValue.id)
  }

  const handleAction = () => {
    if (restoreType === 'previousLocation') {
      dispatch(restorePost(post))
    } else {
      let targetDetails = {
        matterId: props.matter.id,
        projectId: selectedProject,
        taskId: selectedTask,
        type: 'newLocation',
      }
      dispatch(restorePost(post, targetDetails))
    }
  }

  const isTargetUnavailable = useSelector(
    state => state.postArchive.restore.originalTask.task.invalidTarget
  )

  if (isTargetUnavailable) {
    setRestoreType('newLocation')
  }
  return (
    <JuralioDialog
      open={true}
      titleText={t('postArchive.restoreDialog.title') + ' : ' + post.name}
      titleIcon={mdiArchive}
      actionLabel={t('unarchiveDialog.restore')}
      handleAction={() => {
        handleAction()
        setIsActivelyRestoring(true)
      }}
      handleCancel={closeDialog}
      onClose={closeDialog}
      disabled={
        isTargetUnavailable || disableDialog || disableDialogPrevLocation
      }
      fullScreen={isMobileView}
      showLoadingBar={!isTargetUnavailable && isActivelyRestoring}
      loadingText={t('postArchive.restoringPostPrompt')}
    >
      <DialogContent data-test="dialog-content">
        <FormControl className={classes.root}>
          <RadioGroup
            value={restoreType}
            onChange={e => handleRestoreTypeChange(e)}
          >
            <PreviousPostLocation
              post={post}
              disableDialog={disableDialogPrevLocation}
            />
            <NewLocationPostOption
              post={post}
              restoreType={restoreType}
              selectedProject={selectedProject}
              targetTasks={targetTasks}
              selectedTask={selectedTask}
              handleProjectChange={handleProjectChange}
              handleTaskChange={handleTaskChange}
              disableDialog={disableDialog}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
    </JuralioDialog>
  )
}

export default PostRestoreDialog
