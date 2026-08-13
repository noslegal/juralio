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

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { CONFIG, TASK_STATUS } from '../../constants'
import { createNewTemplateTask } from '../../template-task-details/template-task-actions'
import SubTaskPanelContainer from '../SubTaskPanelContainer'
import { createNewTask } from '../task-actions'
import SubtasksTitle from './components/SubtasksTitle'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: JuralioNamedColours.beige[100],
    borderRadius: theme.spacing(0.5),
    boxShadow: theme.shadows[15],
    height: 'calc(100% - 8px)',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(),
    padding: theme.spacing(),
    paddingTop: 0,
  },
  rootMobile: {
    backgroundColor: JuralioNamedColours.beige[100],
    borderRadius: theme.spacing(0.5),
    height: 'calc(100% - 8px)',
    padding: theme.spacing(),
    paddingRight: theme.spacing(),
    paddingTop: 0,
    width: '100%',
  },
}))

const SubtasksColumn = props => {
  const { classes } = useStyles()
  const { task, isReadOnly, isMobile, matterId, templateId } = props
  const [tasks, setTasks] = useState(task.tasks)
  const [showNewPlaceholder, setShowNewPlaceholder] = useState(false)
  const dispatch = useDispatch()
  const placeHolderTask = {
    name: '',
    id: -1,
    status: TASK_STATUS.NOT_STARTED,
  }
  const placeHolderTemplateTask = {
    name: '',
    id: -1,
  }
  useEffect(() => {
    if (showNewPlaceholder && task.tasks.length < CONFIG.SUBTASK_LIMIT) {
      setTasks([
        ...task.tasks,
        templateId ? placeHolderTemplateTask : placeHolderTask,
      ])
    } else {
      setTasks(task.tasks)
    }
  }, [task, showNewPlaceholder]) //eslint-disable-line

  const addPlaceholderTask = () => {
    setTasks([...tasks, templateId ? placeHolderTemplateTask : placeHolderTask])
  }

  const savePlaceholderTask = name => {
    const newTask = {
      name: name,
      id: -1,
      status: TASK_STATUS.NOT_STARTED,
    }
    const newTemplateTask = {
      name: name,
      id: -1,
    }
    setTasks([...task.tasks, templateId ? newTemplateTask : newTask])
    if (templateId) {
      dispatch(createNewTemplateTask(templateId, task.id, name)).then(() => {
        setShowNewPlaceholder(true)
      })
    } else {
      dispatch(
        createNewTask(
          matterId,
          task.projectId,
          props.task.id,
          TASK_STATUS.NOT_STARTED,
          name,
          false
        )
      ).then(() => {
        setShowNewPlaceholder(true)
      })
    }
  }

  const removePlaceholderTask = context => {
    if (context !== 'save') {
      setTasks(task.tasks)
    }
  }

  return (
    <div className={isMobile ? classes.rootMobile : classes.root}>
      <SubtasksTitle
        addTask={addPlaceholderTask}
        isReadOnly={isReadOnly}
        taskCount={tasks.length}
        taskLevel={task.level}
      />
      <SubTaskPanelContainer
        task={task}
        tasks={tasks}
        matterId={matterId}
        templateId={templateId}
        isReadOnly={isReadOnly}
        viewOnly={props.viewOnly}
        addTask={addPlaceholderTask}
        saveTask={savePlaceholderTask}
        removeTask={removePlaceholderTask}
      />
    </div>
  )
}

export default SubtasksColumn
