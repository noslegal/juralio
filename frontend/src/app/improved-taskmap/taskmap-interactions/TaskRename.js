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

import { Box, Checkbox, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import {
  getTemplateIdFromLocation,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import {
  fetchTemplateTaskmapStructure,
  removePlaceHolderTask,
  replacePlaceholderTaskWithCreatedTask,
  replaceTask,
  replaceTemplateTask,
  updateTaskmapStructure,
  updateTaskWithoutFetch,
} from '../../../redux/ducks/improved-taskmap'
import { completeTaskRename } from '../../../redux/ducks/improved-taskmap-interactions'
import taskService from '../../../services/task/task-service'
import templateService from '../../../services/template/template-service'
import { CONFIG } from '../../constants'
import {
  updateProjectSubtasks,
  updateTaskSubtasks,
} from '../../task-map/selected-task/selected-task-actions'
import {
  deleteInTreeById,
  findNodeInTree,
  updateStructureById,
} from '../taskmap-helpers/tree-helpers'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { updateTemplateTasks } from '../../template-task-details/template-task-actions'
import cloneDeep from 'lodash/cloneDeep'

const styles = makeStyles()(theme => ({
  button: {
    textTransform: 'none',
    display: 'flex',
    position: 'absolute',
    zIndex: 100,
    minWidth: '100px',
    color: juralioColours.darkText.primary,
    padding: '3px',
    cursor: 'pointer',
    alignItems: 'anchor-center',
  },
}))

const TaskRename = props => {
  const { classes } = styles()
  const dispatch = useDispatch()
  const location = useLocation()
  const [value, setValue] = useState(props.task?.name || '')
  const [createDeliverable, setCreateDeliverable] = useState(false)
  const structure = useSelector(state => state.improvedTaskmap.structure)
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const taskmapFilter = useSelector(state => state.taskMapFilter)
  const taskCell = document.getElementById(`task-cell-name-${props.task?.id}`)
  const isTemplate = isInTemplate(window.location.href)
  const templateId = getTemplateIdFromLocation(location)

  const onConfirm = () => {
    const moveMask = document.getElementById('rename-mask')
    if (moveMask) {
      moveMask.remove()
    }
  }

  const onCancel = (escPressed = false) => {
    const moveMask = document.getElementById('rename-mask')
    moveMask.remove()
    window.localStorage.setItem('dropZoneId', '-1')
    window.dispatchEvent(new Event('completeMove'))
    save(escPressed)
  }

  useEffect(() => {
    let r = document.getElementById('improved-taskmap')
    let moveMask = document.getElementById('name-mask')
    let d = document.createElement('div')
    d.style.width = '100%'
    d.style.height = '100%'
    d.style.top = '0'
    d.style.left = '0'
    d.style.zIndex = 99
    d.style.position = 'fixed'
    d.style.backgroundColor = 'black'
    d.style.opacity = '20%'
    d.id = 'rename-mask'
    const x = onCancel
    d.onclick = x
    if (r && !moveMask) {
      r.appendChild(d)
    } //eslint-disable-next-line
  }, [])

  if (!taskCell) {
    dispatch(completeTaskRename())
    return null
  }
  const boundingRect = taskCell.getBoundingClientRect()

  const handleChange = e => {
    let newValue = e.target.value
    setValue(newValue)
  }
  const cancelPlaceholderTask = () => {
    let fakeStructure = { tasks: [...structure] }
    fakeStructure = deleteInTreeById(fakeStructure, -1)
    dispatch(removePlaceHolderTask(fakeStructure))
  }

  const reorder = (matterId, projectId, parentTaskId, newOrder) => {
    if (parentTaskId) {
      dispatch(
        updateTaskSubtasks(
          matterId,
          projectId,
          undefined,
          parentTaskId,
          newOrder,
          true
        )
      )
    } else {
      dispatch(
        updateProjectSubtasks(
          matterId,
          projectId,
          undefined,
          parentTaskId,
          newOrder,
          true
        )
      )
    }
  }

  const templateReorder = (templateId, parentTaskId, newOrder) => {
    dispatch(
      updateTemplateTasks(templateId, {
        taskOrder: newOrder,
        parentTaskId: parentTaskId,
      })
    )
  }

  const _UpdateAfterTaskCreation = (
    children,
    task,
    placeholderObject,
    fakeStructure
  ) => {
    let quickAdd = false
    if (children && children.length > 0) {
      const index = children.map(t => t.id).indexOf(-1)
      const structureItem = {
        id: task.id,
        name: task.name,
        parent: task.parent,
        status: task.status,
        isMilestone: false,
        tasks: [],
      }
      if (index !== -1) {
        children[index] = structureItem
      } else {
        children = [structureItem]
      }

      if (task.level === 1) {
        if (children.length < CONFIG.LEVEL_A_TASK_LIMIT) {
          quickAdd = true

          children.splice(index + 1, 0, placeholderObject)
        }
      } else {
        if (children.length < CONFIG.SUBTASK_LIMIT) {
          quickAdd = true

          children.splice(index + 1, 0, placeholderObject)
        }
      }
      fakeStructure = updateStructureById(
        props.task.parent.id,
        fakeStructure,
        children
      )
      dispatch(
        replacePlaceholderTaskWithCreatedTask(
          //template?
          task,
          fakeStructure.tasks,
          quickAdd ? placeholderObject : undefined
        )
      )
      if (isTemplate) {
        if (props.task.parent.id && props.task.parent.id !== -1) {
          templateService
            .getTemplateTask(templateId, props.task.parent.id)
            .then(res => {
              if (res.status === 200) {
                dispatch(replaceTemplateTask(templateId, res.body))
              }
            })
        } else {
          if (!quickAdd) {
            dispatch(fetchTemplateTaskmapStructure(templateId, true))
          }
        }
      } else {
        let taskList = cloneDeep(tasks)
        taskList.push(task)
        if (task.level > 1) {
          if (taskList.find(t => t.id === props.task.parent.id).tasks) {
            taskList.find(t => t.id === props.task.parent.id).tasks.push(task)
          } else {
            taskList.find(t => t.id === props.task.parent.id).tasks = [task]
          }
        }
        if (props.task.parent.id && props.task.parent.id !== -1) {
          dispatch(
            updateTaskmapStructure(
              fakeStructure,
              props.task.matterId,
              props.task.project.id,
              true,
              taskList
            )
          )
        } else {
          if (!quickAdd) {
            //remove placeholder
            taskList.splice(0, 1)
            dispatch(
              updateTaskmapStructure(
                fakeStructure,
                props.task.matterId,
                props.task.project.id,
                true,
                taskList
              )
            )
          }
        }
      }
    } else {
      let _fakeStructure = fakeStructure
      _fakeStructure = {
        tasks: [
          ...fakeStructure.tasks.filter(t => t.id !== -1),
          task,
          placeholderObject,
        ],
      }
      quickAdd = _fakeStructure.tasks.length < 9
      dispatch(
        replacePlaceholderTaskWithCreatedTask(
          //template?
          task,
          _fakeStructure.tasks,
          quickAdd ? placeholderObject : undefined
        )
      )
      if (isTemplate) {
        if (props.task.parent.id !== -1) {
          templateService
            .getTemplateTask(templateId, props.task.parent.id)
            .then(res => {
              if (res.status === 200) {
                dispatch(replaceTemplateTask(templateId, res.body))
              }
            })
        } else {
          dispatch(fetchTemplateTaskmapStructure(templateId, true))
        }
      } else {
        if (props.task.parent.id !== -1) {
          taskService
            .getTaskById(
              props.task.matterId,
              props.task.project.id,
              props.task.parent.id
            )
            .then(res => {
              if (res.status === 200) {
                dispatch(replaceTask(res.body))
              }
            })
        } else {
          // dispatch(
          //   fetchTaskmapStructure(
          //     props.task.matterId,
          //     props.task.project.id || props.projectId,
          //     true
          //   )
          // )
        }
      }
    }
  }

  const save = (escPressed = false) => {
    if (props.task.id === -1) {
      //is a placeholder
      if (value === '' || escPressed) {
        //cancel it
        cancelPlaceholderTask()
      } else {
        onConfirm()
        if (isTemplate) {
          templateService
            .createTemplateTask(
              templateId,
              props.task.parent.id === -1 ? null : props.task.parent.id,
              value,
              createDeliverable
            )
            .then(res => {
              if (res.status === 200) {
                let fakeStructure = { tasks: [...structure] }
                let children = findNodeInTree(
                  fakeStructure,
                  props.task.parent.id
                ).tasks

                templateReorder(
                  templateId,
                  props.task.parent.id === -1 ? null : props.task.parent.id,
                  children
                    ? children.map(c => (c.id === -1 ? res.body : c))
                    : []
                )
                let placeholderObject = {
                  id: -1,
                  templateId: templateId,
                  level: -1,
                  parent: { id: props.task.parent.id },
                  tasks: [],
                }
                _UpdateAfterTaskCreation(
                  children,
                  res.body,
                  placeholderObject,
                  fakeStructure
                )
              }
            })
        } else {
          if (createDeliverable) {
          } else {
          }
          taskService
            .createTask(
              props.task.matterId,
              props.task.project.id || props.projectId,
              props.task.parent.id === -1 ? null : props.task.parent.id,
              props.task.status,
              value,
              false,
              createDeliverable
            )
            .then(res => {
              if (res.status === 201) {
                let fakeStructure = { tasks: [...structure] }
                let children = findNodeInTree(
                  fakeStructure,
                  props.task.parent.id
                ).tasks?.map(t => {
                  if (t.id === -1) {
                    return t
                  }
                  return tasks.find(ts => ts.id === t.id)
                })
                reorder(
                  props.task.matterId,
                  props.task.project.id,
                  props.task.parent.id === -1 ? null : props.task.parent.id,
                  children
                    ? children.map(c => (c.id === -1 ? res.body : c))
                    : []
                )
                let placeholderObject = {
                  id: -1,
                  project: { id: props.task.project.id },
                  matterId: props.task.matterId,
                  level: -1,
                  status: props.task.status,
                  parent: { id: props.task.parent.id },
                  tasks: [],
                }
                _UpdateAfterTaskCreation(
                  children,
                  res.body,
                  placeholderObject,
                  fakeStructure
                )
              }
            })
        }
      }
    } else {
      if (isTemplate) {
        onConfirm()
        templateService.updateTemplateTask(templateId, props.task.id, {
          name: value,
        })
        dispatch(updateTaskWithoutFetch(props.task.id, { name: value }))
      } else {
        onConfirm()
        taskService.updateTask(
          props.task.matterId,
          props.task.project.id,
          props.task.id,
          { name: value },
          true
        )
        dispatch(updateTaskWithoutFetch(props.task.id, { name: value }))
      }
    }
    dispatch(completeTaskRename())
  }

  const onKeyDown = e => {
    e.stopPropagation()
    if (e.keyCode === 13) {
      save()
    }
    if (e.keyCode === 27) {
      if (props.task.id === -1) {
        cancelPlaceholderTask()
        dispatch(completeTaskRename())
        onCancel(true)
      }
    }
  }

  const isCompact = isTemplate
    ? taskmapFilter.detailedView.templateViewMode === 2
    : taskmapFilter.detailedView.viewMode === 2

  return (
    <>
      <Box
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          left:
            boundingRect.x -
            80 +
            document.getElementById('improved-taskmap-wrapper').scrollLeft,
          top:
            boundingRect.y -
            90 +
            document.getElementById('improved-taskmap-wrapper').scrollTop -
            (isCompact ? 8 : 0),
          zIndex: 100,
          minWidth: '100px',
        }}
        sx={{ boxShadow: 3 }}
      >
        <TextField
          id="task-name-field"
          value={value}
          onChange={handleChange}
          onBlur={props.task.id !== -1 ? save : ''}
          autoFocus={true}
          onKeyDown={onKeyDown}
          data-test="edit-name-field"
          slotProps={{
            input: { disableUnderline: true },
            htmlInput: { maxLength: 70 },
          }}
        />
      </Box>
      {props.task.id === -1 &&
        props.task.parent.id !== undefined &&
        props.task.parent.id !== -1 && (
          <div
            onClick={() => {
              document.getElementById('task-name-field').focus()
              setCreateDeliverable(!createDeliverable)
            }}
            className={classes.button}
            style={
              createDeliverable
                ? {
                    left:
                      boundingRect.x +
                      document.getElementById('improved-taskmap-wrapper')
                        .scrollLeft +
                      80,
                    top:
                      boundingRect.y -
                      90 +
                      document.getElementById('improved-taskmap-wrapper')
                        .scrollTop -
                      (isCompact ? 8 : 0),
                  }
                : {
                    left:
                      boundingRect.x +
                      document.getElementById('improved-taskmap-wrapper')
                        .scrollLeft +
                      80,
                    top:
                      boundingRect.y -
                      90 +
                      document.getElementById('improved-taskmap-wrapper')
                        .scrollTop -
                      (isCompact ? 8 : 0),
                  }
            }
          >
            <Checkbox style={{ padding: '0px' }} checked={createDeliverable} />
            <Typography variant="caption">Create as deliverable</Typography>
          </div>
        )}
    </>
  )
}
export default TaskRename
