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

import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { CONFIG, TASK_MENU_CONTEXT } from '../../app/constants'
import TaskRenamePopover from '../../components/data-display/task-cell/TaskRenamePopover'
import TaskOperationsMenu from '../../components/icicle/desktop/menu/TaskOperationsMenu'
import TaskGroup from '../../components/layouts/task-group/TaskGroup'
import MaximumSubtasksMessage from './MaximumSubtasksMessage'
import NotRequiredSubtasksMessage from './NotRequiredSubtasksMessage'

const styles = makeStyles()(theme => ({
  panel: {
    marginLeft: theme.spacing(2),
    height: 'calc(100% - 48px)',
    overflowY: 'auto',
    '& .task-group': {
      marginBottom: theme.spacing(),
    },
    '& .task-group:last-child': {
      marginBottom: 0,
    },
  },
  subTaskHelp: {
    marginTop: theme.spacing(4),
    maxWidth: theme.spacing(40),
  },
  subTaskHelpLink: {
    display: 'inline-block',
    cursor: 'pointer',
  },
  levelFText: {
    marginTop: '10%',
  },
}))

export const SubTaskPanelSubsectionId = {
  Done: 'Done',
  InProgress: 'InProgress',
  NotStarted: 'NotStarted',
  Template: 'Template',
}

const linkClickForwarder = e => {
  if (e.target && e.defaultPrevented) {
    const closestLink = e.target.closest('a')

    if (closestLink) {
      const eventName = 'click'
      let clone

      if (document.createEvent) {
        clone = document.createEvent('MouseEvents')
        clone.initEvent(eventName, true, true)
        clone.preventDefault = () => {}
      } else {
        const cloneProps = {}

        for (let p in e) {
          cloneProps[p] = e[p]
        }

        cloneProps.defaultPrevented = false
        clone = new MouseEvent(eventName, cloneProps)
      }

      e.stopPropagation()
      closestLink.dispatchEvent(clone)
    }
  }
}

const SubTaskPanel = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const { notStartedTasks, inProgressTasks, doneTasks, templateTasks } = props
  const [menuState, setMenuState] = useState(null)
  const [renameState, setRenameState] = useState(null)

  const closeMenuHandler = () => setMenuState(null)
  const closeRenameHandler = context => {
    if (renameState.taskNameTask.id === -1) {
      props.removeTask(context)
    }
    setRenameState(null)
  }
  const isExternal = useSelector(state => state.auth.data.details.isExternal)

  const subtasksFull = props.taskCount === CONFIG.SUBTASK_LIMIT

  const isLevelF = props.taskCount === 0 && props.currentLevel === 6

  // React-beautiful-dnd is currently swallowing the next click event to take place after a drag and drop
  // interaction by incorrectly calling 'preventDefault' on it, causing it to be ignored by react-router-dom
  // Links.  This should be fixed in the library, but for now we work around it by re-issuing the event.  An
  // issue has been opened with the maintainers here: https://github.com/atlassian/react-beautiful-dnd/issues/1528
  useEffect(() => {
    document.addEventListener('click', linkClickForwarder)
    return () => {
      document.removeEventListener('click', linkClickForwarder)
    }
  }, [])

  const handleOptionsClick = (e, task) => {
    if (e && e.currentTarget) {
      setMenuState({ anchor: e.currentTarget, task: task })
    } else {
      setMenuState(null)
    }
    e.stopPropagation()
  }

  const handleRenameClick = (e, clickedCellData) => {
    if (menuState) {
      const taskCell = menuState.anchor.closest('[data-task-cell]')
      const taskName = taskCell.querySelector('[data-task-name]')
      setRenameState({
        taskNameAnchor: taskName,
        taskNameTask: clickedCellData,
      })
      setMenuState(null)
    }
    e.stopPropagation()
  }

  useEffect(() => {
    setTimeout(() => {
      let placeholderTask = props.templateId
        ? props.templateTasks.find(task => task.id === -1)
        : props.notStartedTasks.find(task => task.id === -1)

      if (placeholderTask && placeholderTask.name === '') {
        const taskCell = document.getElementById('task-cell-name--1')
        setRenameState({
          taskNameAnchor: taskCell,
          taskNameTask: placeholderTask,
        })
        setMenuState(null)
      }
    }, 100)
  }, [props.notStartedTasks, props.templateTasks]) //eslint-disable-line

  return (
    <div className={classes.panel}>
      <DragDropContext onDragEnd={props.onDragEnd}>
        <TaskGroup
          items={doneTasks}
          matterId={props.matterId}
          projectId={props.projectId}
          title={t('subTaskPanel.taskStatusDone')}
          data-test="done-tasks"
          droppableId={SubTaskPanelSubsectionId.Done}
          handleOptionsClick={handleOptionsClick}
          onCollapseClick={props.onCollapseClick}
          isReadOnly={props.viewOnly || isExternal}
        />
        <TaskGroup
          items={inProgressTasks}
          matterId={props.matterId}
          projectId={props.projectId}
          title={t('subTaskPanel.taskStatusInProgress')}
          data-test="in-progress-tasks"
          droppableId={SubTaskPanelSubsectionId.InProgress}
          handleOptionsClick={handleOptionsClick}
          onCollapseClick={props.onCollapseClick}
          isReadOnly={props.viewOnly || isExternal}
        />
        <TaskGroup
          items={notStartedTasks}
          matterId={props.matterId}
          projectId={props.projectId}
          title={t('subTaskPanel.taskStatusNotStarted')}
          data-test="not-started-tasks"
          droppableId={SubTaskPanelSubsectionId.NotStarted}
          handleOptionsClick={handleOptionsClick}
          onCollapseClick={props.onCollapseClick}
          isReadOnly={props.viewOnly || isExternal}
        />
        <TaskGroup
          items={templateTasks}
          data-test="template-tasks"
          droppableId={SubTaskPanelSubsectionId.Template}
          templateId={props.templateId}
          handleOptionsClick={handleOptionsClick}
          isReadOnly={props.viewOnly || isExternal}
        />
      </DragDropContext>

      <NotRequiredSubtasksMessage tasks={props.notRequiredTasks} />

      {!props.isReadOnly && subtasksFull ? (
        <MaximumSubtasksMessage {...props} classes={classes} />
      ) : null}

      {isLevelF ? (
        <Typography variant="subtitle1" className="">
          {t('subTaskPanel.levelFText')}
        </Typography>
      ) : null}

      {!props.isReadOnly && (
        <React.Fragment>
          <TaskOperationsMenu
            handleRenameClick={handleRenameClick}
            anchor={menuState?.anchor}
            task={menuState?.task}
            matterId={props.matterId}
            isTemplate={!props.matterId}
            onClose={closeMenuHandler}
            taskMenuContext={TASK_MENU_CONTEXT.SUBTASK_PANEL}
            viewOnly={props.viewOnly}
          />
          <TaskRenamePopover
            anchor={renameState ? renameState.taskNameAnchor : null}
            task={renameState ? renameState.taskNameTask : null}
            onClose={closeRenameHandler}
            placeholder={renameState?.taskNameTask?.id === -1}
            updateNameHandler={props.updateNameHandler}
          />
        </React.Fragment>
      )}
    </div>
  )
}

export default SubTaskPanel
SubTaskPanel.propTypes = {
  matterId: PropTypes.string,
  projectId: PropTypes.number,
  templateId: PropTypes.string,
  taskCount: PropTypes.number,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
  currentLevel: PropTypes.number,
}
