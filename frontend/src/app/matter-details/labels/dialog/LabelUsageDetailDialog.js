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

import {
  Button,
  Checkbox,
  DialogContent,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import TaskChip from '../../../../components/data-display/task-chip/TaskChip'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import BigDataSpinner from '../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { removeLabelUses } from '../../../../services/label/label-actions'
import labelService from '../../../../services/label/label-service'
import { LabelsIcon } from '../../../../theme/navigation/CommonIcons'

const useStyles = makeStyles()(theme => ({
  taskChip: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',
  },
  usageDetail: {
    marginLeft: theme.spacing(5),
  },
  selectallButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(1),
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: theme.spacing(38.5),
  },
  checkbox: {
    padding: '0px',
    marginLeft: theme.spacing(),
  },
}))

const LabelUsageDetailDialog = props => {
  const { closeHandler, label, matter } = props
  const { t } = useTranslation()
  const { classes } = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()

  const [areDetailsLoaded, setAreDetailsLoaded] = useState(false)
  const [taskUsageList, setTaskUsageList] = useState([])
  const [screen, setScreen] = useState(0)
  const [tasksToRemove, setTasksToRemove] = useState([])

  const addTaskToRemove = id => {
    let newTaskList = [...tasksToRemove]
    newTaskList.push(id)
    setTasksToRemove(newTaskList)
  }
  const removeTaskToRemove = id => {
    setTasksToRemove(tasksToRemove.filter(t => t !== id))
  }
  const addAllTasksToRemove = () => {
    setTasksToRemove(taskUsageList.map(t => t.id))
  }

  useEffect(() => {
    if (!areDetailsLoaded) {
      labelService.getUsageForLabel(matter.id, label.id).then(response => {
        setTaskUsageList(response.body)
        setAreDetailsLoaded(true)
      })
    }
  }, [setAreDetailsLoaded, areDetailsLoaded, matter.id, label.id])

  const taskCount = taskUsageList.length

  const usageDetailText = t(
    taskCount === 1
      ? 'labels.usage.usedInTaskCount'
      : 'labels.usage.usedInTaskCount_plural',
    {
      count: taskCount,
    }
  )

  const actionHandler = () => {
    if (!isInactive) {
      closeHandler()
    } else {
      if (screen !== 1) {
        setScreen(1)
      } else {
        dispatch(removeLabelUses(matter.id, props.label.id, tasksToRemove))
        closeHandler()
      }
    }
  }
  const titleText =
    (screen ? t('labels.usage.removeTitle') : t('labels.usage.dialogTitle')) +
    label.name
  const isInactive = props.label.inactive

  const getScreen = () => {
    switch (screen) {
      case 0:
        return (
          <div className={classes.wrapper}>
            {!areDetailsLoaded && <BigDataSpinner size={100} />}
            {areDetailsLoaded && isInactive && (
              <Button
                variant="outlined"
                className={classes.selectallButton}
                data-test="remove-all-button"
                color="primary"
                onClick={addAllTasksToRemove}
              >
                {t('labels.usage.removeLabelFromAllTasks')}
              </Button>
            )}
            <div style={{ overflowY: 'auto' }}>
              {taskUsageList.map(task => (
                <div className={classes.taskChip} key={task.id}>
                  <TaskChip
                    isLink={true}
                    task={task}
                    projectId={task.projectId}
                    matterId={matter.id}
                    showOptions={false}
                    showInteractions={false}
                    showDates={false}
                    closeHandler={() => {}}
                  />
                  {isInactive && (
                    <Checkbox
                      className={classes.checkbox}
                      color="primary"
                      checked={tasksToRemove.includes(task.id)}
                      onClick={() => {
                        if (tasksToRemove.includes(task.id)) {
                          removeTaskToRemove(task.id)
                        } else {
                          addTaskToRemove(task.id)
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 1:
        return null
      default:
        return null
    }
  }

  const getSubtitleText = () => {
    switch (screen) {
      case 0:
        return usageDetailText
      case 1:
        return t('labels.usage.removeSubtitle')
      default:
        return usageDetailText
    }
  }

  const getActionLabel = () => {
    switch (screen) {
      case 0:
        return isInactive
          ? t('matterAdmin.labels.removeFromTasks')
          : t('common.close')
      case 1:
        return t('common.confirm')
      default:
        return isInactive
          ? t('matterAdmin.labels.removeFromTasks')
          : t('common.close')
    }
  }

  const getCancelLabel = () => {
    switch (screen) {
      case 0:
        return t('common.close')
      case 1:
        return t('common.cancel')
      default:
        return t('common.close')
    }
  }

  return (
    <JuralioDialog
      open={true}
      titleIcon={LabelsIcon}
      titleText={titleText}
      subtitleText={
        areDetailsLoaded && (
          <Typography
            data-test="dialog-usage-count"
            variant="body2"
            className={classes.usageDetail}
          >
            {getSubtitleText()}
          </Typography>
        )
      }
      hideCancel={!isInactive}
      fullScreen={isMobileView}
      actionLabel={getActionLabel()}
      cancelText={getCancelLabel()}
      context={screen}
      disabled={!isInactive ? false : tasksToRemove.length === 0}
      handleCancel={() => closeHandler()}
      handleAction={actionHandler}
      showLoadingBar={!areDetailsLoaded}
    >
      <DialogContent>{getScreen()}</DialogContent>
    </JuralioDialog>
  )
}

export default LabelUsageDetailDialog
