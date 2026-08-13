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

import InfoIcon from '@mui/icons-material/Info'
import {
  Button,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JurUnlinkDates from '../../../../assets/images/JurUnlinkDates'
import TaskChip from '../../../../components/data-display/task-chip/TaskChip'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { fetchTaskmapContent } from '../../../../redux/ducks/improved-taskmap'
import { isInTaskmapContext } from '../../../../services/helpers/route/route-context-helper'
import taskService from '../../../../services/task/task-service'
import juralioColours from '../../../../theme/juralio-colours'
import { DateLinkingIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'
import { TASK_STATUS } from '../../../constants'
import { fetchProjectWithPostsAndTaskTeam } from '../../../project/project-actions'
import { setTaskDatesLinked } from '../../../task-map/selected-task/selected-task-actions'

const useStyles = makeStyles()(theme => ({
  icon: {
    color: juralioColours.darkText.secondary,
    height: theme.spacing(2),
    marginBottom: '-3px',
  },
  subTitle: {
    marginBottom: theme.spacing(2),
    color: juralioColours.darkText.secondary,
  },
  taskWrapper: {
    display: 'flex',
  },
  chip: {
    minWidth: '85%',
    paddingRight: theme.spacing(1.5),
    alignSelf: 'center',
  },
  linkButton: {
    marginTop: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  },
  linked: {
    backgroundColor: rawColours.status.done.dark,
    border: 'solid',
    borderWidth: theme.spacing(0.125),
    borderColor: 'black',
    padding: theme.spacing(0.5),
    minWidth: theme.spacing(4),
    minHeight: theme.spacing(4),
    '&:hover': {
      backgroundColor: rawColours.status.done.dark,
    },
  },
  unlinked: {
    backgroundColor: rawColours.primary.white.primary,
    padding: theme.spacing(0.5),
    minWidth: theme.spacing(4),
    minHeight: theme.spacing(4),
    border: 'solid',
    borderWidth: theme.spacing(0.125),
    borderColor: juralioColours.darkText.secondary,
    '&:hover': {
      backgroundColor: rawColours.primary.white.primary,
    },
  },
  editAllButton: {
    width: '95%',
    margin: theme.spacing(2),
    marginLeft: theme.spacing(0),
  },
  siblingTasksList: {
    overflowY: 'auto',
    height: theme.spacing(30),
  },
}))

const TaskEditLinkDialog = props => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [tasks, setTasks] = useState(
    props.siblings.filter(
      t =>
        t.status !== TASK_STATUS.DONE && t.status !== TASK_STATUS.NOT_REQUIRED
    )
  )

  const [siblingTaskCount, setSiblingTaskCount] = useState(
    props.siblingTaskCount
  )

  const disableActionButton = () => {
    return tasks.filter(t => t.updated === true).length < 1 ? true : false
  }

  const renderSiblingTasks = () => {
    return tasks.map(
      task =>
        task.id !== props.task.id && (
          <div key={task.id} className={classes.taskWrapper}>
            <div className={classes.chip}>
              <TaskChip noHover={true} task={task} closeHandler={() => {}} />
            </div>
            <div
              className={classes.linkButton}
              data-test="link-task-as-sibling"
            >
              <Tooltip
                title={
                  task.datesLinkedToSiblings
                    ? t('taskLinking.linkedTooltip')
                    : t('taskLinking.unlinkedTooltip')
                }
              >
                <Button
                  disableElevation={true}
                  data-test={'link-button-' + task.datesLinkedToSiblings}
                  onClick={() =>
                    handleLinkTask(task.datesLinkedToSiblings, task.id)
                  }
                  className={
                    task.datesLinkedToSiblings
                      ? classes.linked
                      : classes.unlinked
                  }
                  variant="contained"
                  size="medium"
                >
                  <DateLinkingIcon
                    htmlColor={task.datesLinkedToSiblings ? 'white' : 'black'}
                  />
                </Button>
              </Tooltip>
            </div>
          </div>
        )
    )
  }

  useEffect(() => {
    return () => {
      tasks.forEach(task => {
        if (task.updated === true) {
          task.datesLinkedToSiblings = !task.datesLinkedToSiblings
          task.updated = false
        }
      })
    }
  }, []) // eslint-disable-line
  //stops error with empty dependancy array

  const handleAction = () => {
    return taskService
      .linkTaskList(props.matterId, props.projectId, [...tasks])
      .then(() => {
        if (isInTaskmapContext()) {
          dispatch(fetchTaskmapContent(props.matterId, props.projectId))
        }
        dispatch(
          fetchProjectWithPostsAndTaskTeam(props.matterId, props.projectId)
        )
        dispatch(setTaskDatesLinked(siblingTaskCount > 0))
      })
  }

  const handleLinkTask = (isLinked, id) => {
    const newTaskList = [...tasks]
    const index = tasks.findIndex(task => task.id === id)
    let tempSiblingTaskCount = siblingTaskCount

    newTaskList[index].datesLinkedToSiblings = !isLinked
    if (isLinked) {
      tempSiblingTaskCount--
    } else {
      tempSiblingTaskCount++
    }
    if (newTaskList[index].updated !== true) {
      newTaskList[index].updated = true
    } else {
      newTaskList[index].updated = false
    }

    const taskInContextIndex = tasks.findIndex(
      task => task.id === props.task.id
    )
    const linkedTasks = newTaskList.filter(
      t => t.datesLinkedToSiblings === true || t.id === props.task.id
    )

    // link/unlink task that opened the dialog, based on whether another task is selected
    if (linkedTasks.length === 1) {
      newTaskList[taskInContextIndex].datesLinkedToSiblings = false
      tempSiblingTaskCount = 0
    } else if (!newTaskList[taskInContextIndex]?.datesLinkedToSiblings) {
      newTaskList[taskInContextIndex].datesLinkedToSiblings = true
      tempSiblingTaskCount++
    }

    setSiblingTaskCount(tempSiblingTaskCount)
    setTasks(newTaskList)
  }

  const handleEditAll = () => {
    const newTaskList = [...tasks]
    if (siblingTaskCount === tasks.length) {
      newTaskList.forEach(task => {
        if (task.datesLinkedToSiblings === true) {
          task.datesLinkedToSiblings = false
          if (task.updated !== true) {
            task.updated = true
          } else {
            task.updated = false
          }
        }
        setSiblingTaskCount(0)
      })
    } else {
      newTaskList.forEach(task => {
        if (task.datesLinkedToSiblings === false) {
          task.datesLinkedToSiblings = true
          if (task.updated !== true) {
            task.updated = true
          } else {
            task.updated = false
          }
        }
      })
      setSiblingTaskCount(tasks.length)
    }
    setTasks(newTaskList)
  }

  return (
    <JuralioDialog
      open={true}
      titleText={t('editTaskLink.dialogHeader')}
      titleIcon={DateLinkingIcon}
      actionLabel={t('common.confirm')}
      handleAction={() => {
        handleAction()
        props.handleClose()
      }}
      handleCancel={props.handleCancel}
      onClose={props.handleClose}
      fullScreen={isMobileView}
      disabled={disableActionButton()}
      style={{ overflow: 'hidden' }}
    >
      <DialogContent
        style={{ position: 'relative', overflow: 'hidden', height: '87%' }}
        data-test="dialog-content"
      >
        <Typography className={classes.subTitle} variant="subtitle2">
          {t('editTaskLink.dialogSubHeader1')}
          <Tooltip title={t('editTaskLink.dialogTooltip')}>
            <InfoIcon className={classes.icon} />
          </Tooltip>
          {t('editTaskLink.dialogSubHeader2')}
        </Typography>
        {tasks.length > 2 && (
          <Button
            className={classes.editAllButton}
            disableElevation={true}
            onClick={() => handleEditAll()}
            variant="outlined"
            data-test="edit-all-links-button"
            startIcon={
              siblingTaskCount === tasks.length ? (
                <JurUnlinkDates />
              ) : (
                <DateLinkingIcon />
              )
            }
          >
            {siblingTaskCount === tasks.length
              ? t('editTaskLink.unlinkAll')
              : t('editTaskLink.linkAll')}
          </Button>
        )}
        <div className={classes.siblingTasksList}>{renderSiblingTasks()}</div>
      </DialogContent>
    </JuralioDialog>
  )
}

export default TaskEditLinkDialog
