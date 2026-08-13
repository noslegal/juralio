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

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import labelService from '../../../services/label/label-service'
import { LABEL_TYPES, TASK_STATUS } from '../../constants'
import { fetchTaskDetails } from '../../task-map/selected-task/selected-task-actions'
import AddLabelFlow from './AddLabelFlow'
import TaskLabel from './TaskLabel'
import TaskLabelIcon from './TaskLabelIcon'

const style = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const TaskLabelContainer = props => {
  const { classes } = style()
  const dispatch = useDispatch()
  const { task, isTaskPreview, forceUpdatePreview } = props
  const [showAddLabelFlow, setShowAddLabelFlow] = useState(false)
  const [loadedLabels, setLoadedLabels] = useState(false)
  const [labels, setLabels] = useState([])
  const [allLabels, setAllLabels] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const taskLabels = task.labels || []
  const [debouncing, setDebouncing] = useState(false)

  const reset = () => {
    setShowAddLabelFlow(false)
    setLoadedLabels(false)
    setLabels([])
  }

  const closeAddFlow = () => {
    setShowAddLabelFlow(false)
  }

  const removeLabel = labelId => {
    labelService
      .removeLabelFromTask(task.matterId, task.projectId, task.id, labelId)
      .then(res => {
        if (res.status === 200) {
          if (isTaskPreview) {
            forceUpdatePreview()
          }
          dispatch(fetchTaskDetails(task.matterId, task.projectId, task.id))
          setAllLabels(allLabels.filter(label => label.id !== labelId))
        }
      })
  }

  const addLabel = event => {
    setLoadedLabels(false)
    setAnchorEl(event.currentTarget)
    setShowAddLabelFlow(true)
    labelService.getMatterLabels(task.matterId, false, true).then(res => {
      if (res.status === 200) {
        const existingLabelIds = taskLabels.map(label => label.labelId)
        setAllLabels(res.body)
        setLabels(
          res.body.filter(
            label => !label.inactive && !existingLabelIds.includes(label.id)
          )
        )
        setLoadedLabels(true)
      } else {
        reset()
      }
    })
  }

  const completeAddLabelFlow = (labelId, modifier = null) => {
    labelService
      .addLabelToTask(task.matterId, task.projectId, task.id, labelId, modifier)
      .then(res => {
        if (res.status === 200) {
          if (isTaskPreview) {
            forceUpdatePreview()
          }
          dispatch(fetchTaskDetails(task.matterId, task.projectId, task.id))
        }
      })
    setShowAddLabelFlow(false)
    setDebouncing(false)
  }

  const createAndAddLabel = (labelName, type = LABEL_TYPES.USER_DEFINED) => {
    if (!debouncing) {
      setDebouncing(true)
      if (
        labels
          .filter(l => l.type === type)
          .map(l => l.name)
          .includes(labelName)
      ) {
        completeAddLabelFlow(
          labels.find(label => label.type === type && label.name === labelName)
            .id
        )
      } else {
        labelService
          .addMatterLabel(task.matterId, labelName, type)
          .then(res => {
            if (res.status === 200) {
              completeAddLabelFlow(res.body.id)
            } else {
              setDebouncing(false)
            }
          })
      }
    }
  }

  const handleModifierUpdate = (labelId, modifier) => {
    if (modifier == null) {
      removeLabel(labelId)
    } else {
      labelService
        .updateTaskLabel(
          task.matterId,
          task.projectId,
          task.id,
          labelId,
          modifier
        )
        .then(res => {
          if (res.status === 200) {
            if (isTaskPreview) {
              forceUpdatePreview()
            }
            dispatch(fetchTaskDetails(task.matterId, task.projectId, task.id))
          }
        })
    }
  }

  if (
    [TASK_STATUS.DONE, TASK_STATUS.NOT_REQUIRED].includes(task.status) &&
    taskLabels.length === 0
  ) {
    return null
  }

  return (
    <div className={classes.wrapper}>
      {(taskLabels.length !== 0 || !props.viewOnly) && (
        <TaskLabelIcon isTaskPreview={props.isTaskPreview} />
      )}
      <TaskLabel
        task={task}
        labels={taskLabels}
        addLabel={addLabel}
        inactiveLabels={taskLabels.filter(l => l.inactive)}
        canAddAndEditLabels={
          ![TASK_STATUS.DONE, TASK_STATUS.NOT_REQUIRED].includes(task.status) &&
          !props.viewOnly
        }
        handleModifierUpdate={handleModifierUpdate}
        viewOnly={props.viewOnly}
      />
      {showAddLabelFlow && (
        <AddLabelFlow
          completeAddLabelFlow={completeAddLabelFlow}
          anchorEl={anchorEl}
          labels={labels}
          allLabels={allLabels}
          isLoaded={loadedLabels}
          closeAddFlow={closeAddFlow}
          createAndAddLabel={createAndAddLabel}
          currentTaskLabels={taskLabels}
        />
      )}
    </div>
  )
}

export default TaskLabelContainer
