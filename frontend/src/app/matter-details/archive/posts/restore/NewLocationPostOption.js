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

import { FormControl, FormControlLabel, Radio, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import ErrorBox from '../../../../../components/data-display/error-box/ErrorBox'
import WorkstreamSelect from '../../../../../components/inputs/workstream-select/WorkstreamSelect'
import juralioColours from '../../../../../theme/juralio-colours'
import TaskMoveTaskSelect from '../../../../task-details/task-options/task-move/task-move-dialog/task-select/TaskMoveTaskSelect'
import { getTargetTask } from '../task-post-archive-actions'

const useStyles = makeStyles()(theme => ({
  previousLocation: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousLocationPrompt: {
    paddingBottom: theme.spacing(),
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
    paddingBottom: theme.spacing(1),
  },
  notAvailable: {
    color: juralioColours.error,
  },
  errorMessage: {
    display: 'flex',
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
  formLabel: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  root: {
    width: '100%',
  },
  radioText: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    paddingBottom: theme.spacing(4),
  },
  newLocation: {
    width: '100%',
  },
  newLocationRadio: {
    paddingTop: theme.spacing(3),
  },
}))

const NewLocationPostOption = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const isTaskLoading = useSelector(
    state => state.postArchive.restore.originalTask.isLoading
  )
  const isTaskLoaded = useSelector(
    state => state.postArchive.restore.originalTask.isLoaded
  )
  const isTargetUnavailable = useSelector(
    state => state.postArchive.restore.originalTask.task.invalidTarget
  )
  useEffect(() => {
    const postDetails = {
      matterId: props.post.matterWhenArchivedId,
      projectId: props.post.projectWhenArchivedId,
      taskId: props.post.taskWhenArchivedId,
    }
    if (!isTaskLoaded && !isTaskLoading) {
      dispatch(getTargetTask(postDetails))
    }
  }, [dispatch, isTaskLoaded, isTaskLoading, props.post])

  return (
    <FormControlLabel
      classes={{ root: classes.radioText, label: classes.formLabel }}
      value={'newLocation'}
      control={
        <Radio
          data-test={'new-location'}
          disableRipple={true}
          style={{ backgroundColor: 'transparent' }}
          className={classes.newLocationRadio}
          color={'primary'}
        />
      }
      label={
        <div>
          <Typography color={'textPrimary'} variant="subtitle1">
            {t('unarchiveDialog.radioNewLocation')}
          </Typography>
          <Typography color={'textSecondary'} variant="caption">
            {t('unarchiveDialog.radioPostNewLocation')}
          </Typography>

          {props.restoreType === 'newLocation' && (
            <FormControl className={classes.newLocation}>
              <WorkstreamSelect
                matterId={props.post.matterWhenArchivedId}
                selectionChangeHandler={props.handleProjectChange}
                placeholder={t('unarchiveDialog.projectSelect')}
                selectFirstProject={false}
              />
              {props.selectedProject && (
                <div className={classes.select}>
                  <TaskMoveTaskSelect
                    selectedTask={props.selectedTask}
                    validTargetTasks={props.targetTasks}
                    selectionChangeHandler={props.handleTaskChange}
                    placeholderText={t('unarchiveDialog.taskSelect')}
                  />
                </div>
              )}
            </FormControl>
          )}
          {(isTargetUnavailable || props.disableDialog) && (
            <ErrorBox
              error={
                props.disableDialog
                  ? t('postArchive.restoreDialog.maxPosts')
                  : t('postArchive.restoreDialog.originalLocationNotAvailable')
              }
              padding={true}
            />
          )}
        </div>
      }
    ></FormControlLabel>
  )
}

export default NewLocationPostOption
