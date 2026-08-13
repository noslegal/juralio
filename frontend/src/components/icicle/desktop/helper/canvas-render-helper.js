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
  getHeight,
  getLeftPosition,
  getTopPosition,
  getWidth,
} from '../../common/render/update/core-applicators/positioning-helper'

import { TASK_CELL_COLOUR } from '../../../../app/constants'
import { shouldShow } from '../../../../app/improved-taskmap/taskmap-helpers/filter-helpers'
import { getTaskCellColour } from '../../../../services/helpers/task/task-status-colour-helper'

export const renderCanvasMapContent = (
  partitionData,
  scales,
  canvasOptions,
  highlightMap,
  isUserFilterActive,
  newTasks
) => {
  const ctx = document.getElementById(canvasOptions.id).getContext('2d')
  ctx.clearRect(0, 0, canvasOptions.width, canvasOptions.height)
  if (partitionData.data && partitionData.data.tasks) {
    renderNodes(
      ctx,
      partitionData.children,
      scales,
      highlightMap,
      isUserFilterActive,
      newTasks
    )
  }
}

export const improvedCanvasMinimap = (
  structure,
  tasks,
  taskmapHeight,
  taskmapWidth,
  taskMapFilter,
  newTaskIds,
  options = { height: 240, width: 184, ctx: undefined }
) => {
  const ctx = options.ctx
    ? options.ctx
    : document.getElementById('minimap')?.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.clearRect(0, 0, options.width, options.height)
  renderImprovedNodes(
    ctx,
    structure,
    tasks,
    taskmapHeight,
    taskmapWidth,
    0,
    0,
    true,
    taskMapFilter,
    newTaskIds,
    options.width,
    options.height
  )
}

const shouldRenderNode = (structureTask, taskMapFilter) => {
  return shouldShow(structureTask, taskMapFilter)
}

export const renderImprovedNodes = (
  ctx,
  structure,
  tasks,
  taskmapHeight,
  taskmapWidth,
  depth = 0,
  coy = 0,
  isLevelA = true,
  taskMapFilter,
  newTaskIds,
  canvasWidth,
  canvasHeight
) => {
  let currentYOffset = coy

  for (let i = 0; i < structure.length; i++) {
    if (shouldRenderNode(structure[i], taskMapFilter)) {
      currentYOffset =
        currentYOffset +
        renderImprovedNode(
          ctx,
          structure[i],
          tasks,
          currentYOffset,
          taskmapHeight,
          taskmapWidth,
          i,
          depth,
          taskMapFilter,
          newTaskIds,
          canvasWidth,
          canvasHeight
        )
      if (isLevelA) {
        // currentYOffset = currentYOffset + 2
      }
    }
  }
}

const getXScale = (taskmapWidth, canvasWidth) => {
  return canvasWidth / taskmapWidth
  // const taskmap = document.getElementById('improved-taskmap-wrapper')
  // if (taskmap) {
  //   let taskMapWidth = taskmap.getBoundingClientRect()?.width
  //   const minimapWidth = 184
  //   return minimapWidth / taskMapWidth
  // }
  // return 0
}
const getYScale = (taskmapHeight, canvasHeight) => {
  return canvasHeight / taskmapHeight
  // const taskmap = document.getElementById('improved-taskmap-wrapper')
  // if (taskmap) {
  //   let taskMapHeight = taskmap.getBoundingClientRect()?.height
  //   const minimapHeight = 240
  //   return minimapHeight / taskMapHeight
  // }
  // return 0
}

const countLeaves = (structureItem, taskMapFilter) => {
  let leaves = 0
  if (shouldRenderNode(structureItem, taskMapFilter)) {
    if (!structureItem.tasks || !structureItem.tasks?.length) return 1
    let count = task => {
      if (shouldRenderNode(task, taskMapFilter)) {
        if (!task.tasks || !task.tasks.length) {
          leaves++
        }
        if (task.tasks) {
          for (let i = 0; i < task.tasks.length; i++) {
            let child = task.tasks[i]
            count(child)
          }
        }
      }
    }
    count(structureItem)
  }
  return leaves
}

export const renderImprovedNode = (
  ctx,
  structureIcicle,
  tasks,
  currentYOffset,
  taskmapHeight,
  taskmapWidth,
  index,
  depth = 0,
  taskMapFilter,
  newTaskIds,
  canvasWidth,
  canvasHeight
) => {
  //if children do something
  if (structureIcicle.tasks?.length > 0) {
    renderImprovedNodes(
      ctx,
      structureIcicle.tasks,
      tasks,
      taskmapHeight,
      taskmapWidth,
      depth + 1,
      currentYOffset,
      false,
      taskMapFilter,
      newTaskIds,
      canvasWidth,
      canvasHeight
    )
  }

  const xScale = getXScale(taskmapWidth, canvasWidth)
  const yScale = getYScale(taskmapHeight, canvasHeight)
  const xOffSet = xScale * depth + depth * 2
  const leavesUnderSelf = countLeaves(structureIcicle, taskMapFilter)
  ctx.beginPath()

  let height = Math.max(1, leavesUnderSelf) * yScale - 2

  ctx.rect(xOffSet, currentYOffset + 2, xScale, height)
  let task = tasks.find(t => t.id === structureIcicle.id)
  ctx.fillStyle = getTaskCellColour(
    task ? task : structureIcicle,
    newTaskIds && newTaskIds.includes(structureIcicle.id)
      ? TASK_CELL_COLOUR.NEW_TASKS
      : TASK_CELL_COLOUR.NORMAL
  )
  ctx.fill()
  return height + 2
}

const renderNodes = (
  ctx,
  nodes,
  scales,
  highlightMap,
  isUserFilterActive,
  newTasks
) => {
  for (let j = 0; j < nodes.length; j++) {
    renderNode(
      ctx,
      nodes[j],
      scales,
      highlightMap,
      isUserFilterActive,
      newTasks
    )
  }
}

const renderNode = (
  ctx,
  dn,
  scales,
  highlightMap,
  isUserFilterActive,
  newTasks
) => {
  if (dn.children?.length > 0) {
    renderNodes(
      ctx,
      dn.children,
      scales,
      highlightMap,
      isUserFilterActive,
      newTasks
    )
  }

  ctx.beginPath()
  ctx.rect(
    getLeftPosition(dn, scales),
    getTopPosition(dn, scales, 4),
    getWidth(dn, scales) - 4,
    getHeight(dn, scales, 3)
  )

  let mode = isUserFilterActive
    ? highlightMap[dn.data.id]
      ? TASK_CELL_COLOUR.FILTERED_IN
      : TASK_CELL_COLOUR.FILTERED_OUT
    : TASK_CELL_COLOUR.NORMAL
  if (newTasks[dn.data.id]) {
    mode = TASK_CELL_COLOUR.NEW_TASKS
  }
  ctx.fillStyle = getTaskCellColour(dn.data, mode)
  ctx.fill()
}
