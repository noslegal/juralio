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

import { FormControlLabel, Radio, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import ErrorBox from '../../../../../components/data-display/error-box/ErrorBox'
import juralioColours from '../../../../../theme/juralio-colours'
import { getTargetTask } from '../task-post-archive-actions'

const useStyles = makeStyles()(theme => ({
  previousLocation: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousLocationPrompt: {
    color: juralioColours.darkText.secondary,
    paddingBottom: theme.spacing(),
  },
  subtitle: {
    color: juralioColours.darkText.primary,
    paddingBottom: theme.spacing(1),
  },
  prevLocationRadio: {
    paddingBottom: theme.spacing(8),
  },
}))

const PreviousPostLocation = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const isTaskLoading = useSelector(
    state => state.postArchive.restore.originalTask.isLoading
  )
  const isTaskLoaded = useSelector(
    state => state.postArchive.restore.originalTask.isLoaded
  )
  const task = useSelector(state => state.postArchive.restore.originalTask.task)
  const project = useSelector(
    state => state.postArchive.restore.originalProject.project
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
      value={'previousLocation'}
      control={
        <Radio
          className={classes.prevLocationRadio}
          disableRipple={true}
          style={{ backgroundColor: 'transparent' }}
          color={'primary'}
        />
      }
      label={
        <React.Fragment>
          <div>
            <div className={classes.subtitle}>
              <Typography variant="subtitle1">
                {t('unarchiveDialog.radioPreviousLocation')}
              </Typography>
            </div>
            <div className={classes.previousLocationPrompt}>
              <Typography variant="caption">
                {t('postArchive.restoreDialog.restoreOriginal')}
              </Typography>
            </div>
            {isTargetUnavailable || props.disableDialog ? (
              <ErrorBox
                error={t(
                  'postArchive.restoreDialog.originalLocationNotAvailable'
                )}
                padding={true}
              />
            ) : (
              <div>
                <div className={classes.previousLocation}>
                  <Typography variant="caption">
                    {t('unarchiveDialog.radioPrevSub')}
                  </Typography>
                  &nbsp;
                  <Typography variant="subtitle2">{project?.name}</Typography>
                </div>
                <div className={classes.previousLocation}>
                  <Typography variant="caption">
                    {t('unarchiveDialog.radioPrevSub2')}
                  </Typography>
                  &nbsp;
                  <Typography variant="subtitle2">{task?.name}</Typography>
                </div>
              </div>
            )}
          </div>
        </React.Fragment>
      }
    ></FormControlLabel>
  )
}

export default PreviousPostLocation
