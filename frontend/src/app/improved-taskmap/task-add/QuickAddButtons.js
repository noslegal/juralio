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
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import {
  getMatterIdFromLocation,
  getSingleWorkstreamTaskMapUrl,
  getTaskMapUrl,
  //getSingleWorkstreamTaskMapUrl,
  //getTaskMapUrl,
  getTemplateIdFromLocation,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import { CONFIG, TASK_STATUS } from '../../constants'
import {
  createPlaceholderTask,
  createTemplatePlaceholderTask,
} from './quick-add-helper'
import QuickAddbutton from './QuickAddButton'
import {
  completeCreateTaskFromTemplateTask,
  updateTaskmapStructure,
} from '../../../redux/ducks/improved-taskmap'
import { exitSelectionMode } from '../../project/project-actions'
import {
  deleteInTreeById,
  findNodeInTree,
  updateStructureById,
} from '../taskmap-helpers/tree-helpers'
import {
  updateProjectSubtasks,
  updateTaskSubtasks,
} from '../../task-map/selected-task/selected-task-actions'
import taskService from '../../../services/task/task-service'
import { reset } from '../../template/template-actions'
import { templateToProject } from '../../template/project-creation/template-to-project-actions'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'

const QuickAddButtons = props => {
  const history = useNavigate()
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const { t } = useTranslation()
  const structure = useSelector(state => state.improvedTaskmap.structure)
  const levelFilter = useSelector(state => state.taskMapFilter.levelFilter)
  const expandCollapseTaskFilter = useSelector(
    state => state.taskMapFilter.expandCollapseTaskFilter
  )
  const isTemplate = isInTemplate(window.location.href)
  const selectionText = useSelector(
    state => state.taskMapFilter.filterSelectionText
  )
  const improvedTaskmap = useSelector(state => state.improvedTaskmap)
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const selectionLabels = useSelector(state => state.taskMapFilter.filterLabels)
  const statusMilestone = useSelector(
    state => state.taskMapFilter.statusMilestone
  )
  const statusDeliverable = useSelector(
    state => state.taskMapFilter.statusDeliverable
  )
  const location = useLocation()
  const dispatch = useDispatch()
  const [hasBeenClicked, setHasBeenClicked] = useState(false)
  const task = tasks.find(t => t.id === props.task.id)
  const hasBeenCollapsed = expandCollapseTaskFilter.includes(task?.id)
  if (!task || task.id === -1) {
    return null
  }

  let siblings = [],
    siblingStructures = [],
    qaIndex,
    isLastOfStatus = false

  if (tasks) {
    if (task.level === 1) {
      siblings = tasks
      siblingStructures = structure
    } else {
      if (tasks.length > 0) {
        siblings = tasks?.find(t => t.id === task.parent?.id)?.tasks
        if (siblings === undefined) {
          siblings = []
        }
      }
      if (siblings.length > 0) {
        const flatStructure = flatTaskListFromTree({ tasks: structure })
        if (task.level === 1) {
          siblingStructures = structure?.find(
            t => t.id === task.parent.id
          )?.tasks
        } else {
          siblingStructures = flatStructure.find(
            t => t.id === task.parent.id
          )?.tasks
        }
      }
    }

    if (siblingStructures.length > 0) {
      qaIndex = siblingStructures
        .filter(t => t.status === TASK_STATUS.IN_PROGRESS)
        .map(t => t.id)
        .indexOf(task.id)
      isLastOfStatus =
        siblingStructures.filter(t => t.status === TASK_STATUS.IN_PROGRESS)
          .length -
          1 ===
        qaIndex
    }
  }

  const filtersEnabled =
    levelFilter !== 0 ||
    selectionLabels.length > 0 ||
    !detailedView.showRisk ||
    statusMilestone ||
    statusDeliverable ||
    selectionText !== t('filter.anyoneTasks')

  const onlyLevelfilterEnabled =
    levelFilter !== 0 &&
    selectionLabels.length === 0 &&
    detailedView.showRisk &&
    !statusMilestone &&
    !statusDeliverable &&
    selectionText === t('filter.anyoneTasks')

  const getArrayDepth = task => {
    return task.tasks ? 1 + Math.max(0, ...task.tasks.map(getArrayDepth)) : 0
  }

  const getTreeDepth = () => {
    if (props.selectionMode && improvedTaskmap?.taskFromTemplateTasks) {
      return getArrayDepth(improvedTaskmap?.taskFromTemplateTasks[0])
    } else {
      return 0
    }
  }

  const treeTooDeep = props.selectionMode
    ? props.task.level + getTreeDepth() > 6
      ? true
      : false
    : false

  let parent
  let canHaveSiblings = true
  if (task.level === 1) {
    canHaveSiblings =
      tasks.filter(t => t.level === 1).length < CONFIG.LEVEL_A_TASK_LIMIT
    parent = { status: task.status, tasks: tasks.filter(t => t.level === 1) }
  } else {
    parent = tasks.find(t => t.tasks?.map(ct => ct.id).includes(task.id))
    if (!parent) {
      return null
    }
    canHaveSiblings = parent.tasks.length < CONFIG.SUBTASK_LIMIT
  }

  let canHaveChildren = task.tasks
    ? task.tasks.length < CONFIG.SUBTASK_LIMIT &&
      task.level < 6 &&
      task.tasks
        .map(t => {
          let foundTask = tasks.find(tl => tl.id === t.id)
          if (foundTask) {
            return foundTask.status
          } else {
            return null
          }
        })
        .filter((v, i, a) => a.indexOf(v) === i).length <= 1
    : task.level < 6

  if (task.isMilestone) {
    canHaveChildren = false
  }

  const handleClick = (placement, disabled) => {
    if (disabled || hasBeenClicked) {
      return null
    }
    setHasBeenClicked(true)
    if (isTemplate) {
      createTemplatePlaceholderTask(
        getTemplateIdFromLocation(location),
        task,
        parent,
        structure,
        placement,
        tasks,
        dispatch
      )
    } else {
      if (props.selectionMode) {
        createPlaceholderTask(
          getMatterIdFromLocation(location),
          task.project.id,
          task,
          parent,
          structure,
          placement,
          tasks,
          dispatch,
          true
        )
        switch (placement) {
          case 'top':
            break
          case 'bottom':
            break
          case 'right':
            parent = task
            break
          default:
            break
        }
        taskService
          .createTaskFromTemplateTask(
            improvedTaskmap.taskCreateMId,
            improvedTaskmap.taskCreatePId,
            improvedTaskmap.taskFromTemplateTasks[0].id,
            parent.id,
            improvedTaskmap.taskFromTemplateIncludePosts,
            improvedTaskmap.taskFromTemplateIncludeDesc
          )
          .then(res => {
            dispatch(reset())
            let newTask = res.body
            let fakeStructure = { tasks: [...structure] }
            let children
            if (placement === 'top' || placement === 'bottom') {
              fakeStructure = deleteInTreeById(fakeStructure, -1)
              children = findNodeInTree(fakeStructure, parent.id).tasks
              let indexOfDrop = children
                .map(t => t.id)
                .indexOf(parseInt(task.id))
              if (placement === 'top') {
                children.splice(indexOfDrop, 0, res.body)
              } else {
                children.splice(indexOfDrop + 1, 0, res.body)
              }
              fakeStructure = updateStructureById(
                parent.id,
                fakeStructure,
                children
              )
            } else {
              children = task.tasks ? [...task.tasks, res.body] : [res.body]
              children = children.map(task => {
                if (task.id === -1) {
                  return task
                } else {
                  return findNodeInTree({ tasks: structure }, task.id)
                }
              })
              fakeStructure = updateStructureById(
                task.id,
                fakeStructure,
                children,
                newTask
              )
            }
            let newOrder = findNodeInTree(fakeStructure, parent.id)
              .tasks?.filter(e => e !== null)
              .map(t => {
                if (t.id === res.body.id) {
                  return t
                }
                return tasks.find(ts => ts.id === t.id)
              })
            if (parent.id) {
              dispatch(
                updateTaskSubtasks(
                  improvedTaskmap.taskCreateMId,
                  improvedTaskmap.taskCreatePId,
                  undefined,
                  parent.id,
                  newOrder,
                  true
                )
              ).then(res => {
                if (improvedTaskmap.taskCreatePId) {
                  history(
                    getTaskMapUrl(
                      newTask.id,
                      improvedTaskmap.taskCreateMId,
                      improvedTaskmap.taskCreatePId
                    ) + 'h'
                  )
                } else {
                  history(
                    getSingleWorkstreamTaskMapUrl(
                      improvedTaskmap.taskCreateMId
                    ) +
                      '?id=' +
                      newTask.id +
                      'h'
                  )
                }
              })
            } else {
              dispatch(
                updateProjectSubtasks(
                  improvedTaskmap.taskCreateMId,
                  improvedTaskmap.taskCreatePId,
                  undefined,
                  parent.id,
                  newOrder,
                  true
                )
              ).then(res => {
                if (improvedTaskmap.taskCreatePId) {
                  history(
                    getTaskMapUrl(
                      newTask.id,
                      improvedTaskmap.taskCreateMId,
                      improvedTaskmap.taskCreatePId
                    ) + 'h'
                  )
                } else {
                  history(
                    getSingleWorkstreamTaskMapUrl(
                      improvedTaskmap.taskCreateMId
                    ) +
                      '?id=' +
                      newTask.id +
                      'h'
                  )
                }
              })
            }
            let newContent = flatTaskListFromTree({ tasks: [newTask] }).concat(
              tasks
            )
            if (newTask.level > 1) {
              newContent.find(t => t.id === parent.id).tasks.push(newTask)
            }
            dispatch(
              updateTaskmapStructure(
                fakeStructure,
                improvedTaskmap.taskCreateMId,
                improvedTaskmap.taskCreatePId,
                true,
                newContent
              )
            )
            dispatch(completeCreateTaskFromTemplateTask())
            dispatch(exitSelectionMode())
            dispatch(templateToProject.resetTemplateToProjectState())
            //_UpdateAfterTaskCreation(children, res.body, null, fakeStructure, parent)
          })
      } else {
        createPlaceholderTask(
          getMatterIdFromLocation(location),
          task.project.id,
          task,
          parent,
          structure,
          placement,
          tasks,
          dispatch
        )
      }
    }
  }

  return (
    <>
      <QuickAddbutton
        resetOption={filtersEnabled}
        position={'top'}
        onClick={handleClick}
        disabled={
          !canHaveSiblings ||
          (filtersEnabled && !onlyLevelfilterEnabled) ||
          treeTooDeep ||
          (!isLastOfStatus &&
            props.selectionMode &&
            task.status === TASK_STATUS.IN_PROGRESS) ||
          (isLastOfStatus &&
            props.selectionMode &&
            task.status === TASK_STATUS.IN_PROGRESS)
        }
        disabledText={
          (!isLastOfStatus &&
            props.selectionMode &&
            task.status === TASK_STATUS.IN_PROGRESS) ||
          (isLastOfStatus && props.selectionMode && TASK_STATUS.IN_PROGRESS)
            ? t('taskCellHoverButton.cantAddOutside')
            : !canHaveSiblings && task.level === 1
              ? t('taskCellHoverButton.16PhaseLimit')
              : !canHaveSiblings && task.level > 1
                ? t('taskCellHoverButton.8SubtaskLimit')
                : filtersEnabled
                  ? t('taskCellHoverButton.disabledFilter')
                  : props.selectionMode
                    ? treeTooDeep
                      ? t('taskCellHoverButton.taskTreeTooDeep')
                      : t('taskCellHoverButton.noSubtasksAvailable')
                    : null
        }
        selectionMode={props.selectionMode}
      />
      <QuickAddbutton
        resetOption={filtersEnabled}
        position={'bottom'}
        onClick={handleClick}
        disabled={
          !canHaveSiblings ||
          (filtersEnabled && !onlyLevelfilterEnabled) ||
          treeTooDeep ||
          (!isLastOfStatus &&
            props.selectionMode &&
            task.status === TASK_STATUS.IN_PROGRESS)
        }
        disabledText={
          !isLastOfStatus &&
          props.selectionMode &&
          task.status === TASK_STATUS.IN_PROGRESS
            ? t('taskCellHoverButton.cantAddOutside')
            : !canHaveSiblings && task.level === 1
              ? t('taskCellHoverButton.16PhaseLimit')
              : !canHaveSiblings && task.level > 1
                ? t('taskCellHoverButton.8SubtaskLimit')
                : filtersEnabled
                  ? t('taskCellHoverButton.disabledFilter')
                  : props.selectionMode
                    ? treeTooDeep
                      ? t('taskCellHoverButton.taskTreeTooDeep')
                      : t('taskCellHoverButton.noSubtasksAvailable')
                    : null
        }
        selectionMode={props.selectionMode}
      />
      {(canHaveChildren ||
        (!canHaveChildren && task.tasks.length === 8) ||
        props.selectionMode ||
        task.isMilestone) &&
        !hasBeenCollapsed && (
          <QuickAddbutton
            resetLevel={filtersEnabled && onlyLevelfilterEnabled}
            resetOption={filtersEnabled}
            position={'right'}
            disabled={
              filtersEnabled && !onlyLevelfilterEnabled
                ? true
                : filtersEnabled &&
                    onlyLevelfilterEnabled &&
                    task.level >= levelFilter
                  ? true
                  : task.isMilestone
                    ? true
                    : improvedTaskmap.taskFromTemplateTasks
                      ? treeTooDeep || !canHaveChildren
                        ? true
                        : false
                      : !canHaveChildren
                        ? true
                        : false
            }
            onClick={handleClick}
            disabledText={
              filtersEnabled && !onlyLevelfilterEnabled
                ? t('taskCellHoverButton.disabledFilter')
                : filtersEnabled &&
                    onlyLevelfilterEnabled &&
                    task.level >= levelFilter
                  ? t('taskCellHoverButton.cantAddCollapsed')
                  : task.isMilestone
                    ? t('taskCellHoverButton.disabledButton')
                    : improvedTaskmap.taskFromTemplateTasks
                      ? treeTooDeep
                        ? t('taskCellHoverButton.taskTreeTooDeep')
                        : !canHaveChildren
                          ? t('taskCellHoverButton.noSubtasksAvailable')
                          : null
                      : !canHaveChildren && task.tasks.length === 8
                        ? t('taskCellHoverButton.8SubtaskLimit')
                        : null
            }
            selectionMode={props.selectionMode}
          />
        )}
    </>
  )
}
export default QuickAddButtons
