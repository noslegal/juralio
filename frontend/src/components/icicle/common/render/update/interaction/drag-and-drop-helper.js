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

import { select } from 'd3-selection'
import { DRAG_CONSTANT } from './drag-constants'
import {
  applyDropZone,
  applyOffSetToSubTasks,
  applyOpacityToSubTasks,
  getAllChildren,
  getDropIndex,
  getHoveringOver,
  getRectById,
  isReOrderOperation,
  isValidDropZone,
} from './drag-util'
import { clearDropZone } from './drop-zone-helpers'
import { removeNewTaskHighlight } from './new-task-highlight-helper'
import { fadeOutHoverButtons } from './usability-applicator'

let area = null,
  draggedCell = null,
  dragStartX = null,
  dragStartY = null,
  dragging = false,
  dragActionStarted = false,
  levelADrag = false,
  draggedCellStartingX = null,
  draggedCellStartingY = null

const resetDragStatus = d => {
  const taskCell = select('#C' + d.data.id)
  taskCell.style('transform', '').style('z-index', 1)
  dragStartX = null
  dragStartY = null
  dragging = false
  applyOffSetToSubTasks(d, 0, 0, 1)
}

export const dragActionHandlers = {}

export const getDragState = () => {
  return {
    dragStartX,
    dragStartY,
    dragging,
    dragActionStarted,
    levelADrag,
  }
}

export function handleDragStart(event, d) {
  if (d.data.id < 0 || d.data.height === 0) return
  if (d.depth === 0) return
  removeNewTaskHighlight()
  dragStartX = event.x
  dragStartY = event.y
  levelADrag = d.data.level === 1
  draggedCell = this // Old style function so for the scope this the source DIV.

  const data = select('#C' + d.data.id)
  const parent = data?.datum().parent
  if (!parent || !draggedCell) return
  const cellRect = draggedCell.getBoundingClientRect()
  draggedCellStartingX = cellRect.x
  draggedCellStartingY = cellRect.y
  const hPad = cellRect.width * DRAG_CONSTANT.HORIZONTAL_EXTEND_FACTOR // Extend area for reorder.
  const vPad =
    cellRect.height *
    (levelADrag
      ? DRAG_CONSTANT.VERTICAL_EXTEND_FACTOR_LEVEL_A
      : DRAG_CONSTANT.VERTICAL_EXTEND_FACTOR_SUBTASK) // Extend area for reorder.

  const parentRect = getRectById(parent.data.id)

  // Define area for reorder - outside of this initiates move.
  area = {
    x: cellRect.left - hPad,
    y: parentRect.top - vPad,
    width: cellRect.width + hPad * 2,
    height: parentRect.height + vPad * 2,
  }
  area.right = area.x + area.width
  area.bottom = area.y + area.height
}

export function handleDragEnd(event, d) {
  if (!dragging) {
    return
  }

  if (d.data.id < 0 || d === undefined) return
  clearDropZone()
  if (d.depth === 0) return
  const container = dragActionHandlers.containerElement
  const dropIndex = getDropIndex(
    d,
    container.getBoundingClientRect(),
    event.sourceEvent.clientY,
    draggedCellStartingY
  )
  applyOpacityToSubTasks(d, '1.0')

  if (!isReOrderOperation(event, area)) {
    dragActionHandlers.handleTaskMove(event, d, true)
  } else {
    if (!isValidDropZone(d, d.parent.children, dropIndex)) {
      resetDragStatus(d)
      return
    }
    if (d.depth === 0) return
    if (dragActionStarted && d.parent.children.length > 1) {
      const siblings = d.parent.children

      if (dropIndex > -1) {
        handleRequestedReorder(d, siblings, dropIndex)
      }
    }
  }

  resetDragStatus(d)
}

const handleRequestedReorder = (d, siblings, dropIndex) => {
  let newOrderOfTasks = []
  const parentTaskId = d.parent.data.id
  let draggedTaskId = d.data.id
  if (dropIndex === 0) {
    newOrderOfTasks = [
      d,
      ...siblings.filter(task => task.data.id !== d.data.id),
    ]
  } else if (dropIndex === siblings.length) {
    newOrderOfTasks = [
      ...siblings.filter(task => task.data.id !== d.data.id),
      d,
    ]
  } else {
    const idBefore = siblings[dropIndex - 1].data.id
    newOrderOfTasks = siblings.map(s => {
      return s.data.id === d.data.id ? null : s
    })
    const spliceIndex = siblings.findIndex(task => task.data.id === idBefore)
    newOrderOfTasks.splice(spliceIndex + 1, 0, d)
    newOrderOfTasks = newOrderOfTasks.filter(task => task !== null)
  }

  dragActionHandlers.reorderTaskHandler(
    levelADrag,
    parentTaskId,
    newOrderOfTasks.map(task => task.data),
    draggedTaskId
  )
}

export function handleDrag(event, d, mainIcicleRef) {
  dragging = true
  const scrollLeft = mainIcicleRef.scrollLeft
  const scrollTop = mainIcicleRef.scrollTop
  if (d.depth === 0) return
  dragActionStarted = true
  applyOpacityToSubTasks(d, '0.75')
  fadeOutHoverButtons()
  const offsetX = event.x - dragStartX
  const offsetY = event.y - dragStartY

  const container = dragActionHandlers.containerElement
  const rect = container.getBoundingClientRect()
  const x = event.sourceEvent.clientX - rect.left
  const y = event.sourceEvent.clientY - rect.top

  let hoveringOver = d
  let over = getHoveringOver(d, x, y)
  let RHS = false

  if (over.length > 0) {
    hoveringOver = over[0] //disable this to turn of drop moves
  } else if (over.length === 0) {
    //hovering over nothing
    over = getHoveringOver(d, x, y, true)
    if (over.length) {
      let children = getAllChildren(d)
      over = over.filter(o => !children.includes(o))
      let hoverParent = over[over.length - 1]

      RHS = true
      hoveringOver = hoverParent
    }
  }

  if (isReOrderOperation(event, area)) {
    applyDropZone(
      d,
      x,
      y,
      draggedCell,
      draggedCellStartingX,
      draggedCellStartingY,
      hoveringOver,
      RHS,
      scrollLeft,
      scrollTop
    )
  } else {
    clearDropZone()
  }

  applyOffSetToSubTasks(d, offsetX, offsetY, DRAG_CONSTANT.DRAGGED_ITEMS_ZINDEX)

  if (x > rect.width - DRAG_CONSTANT.DRAG_SCROLL_STEP) {
    container.scrollLeft += DRAG_CONSTANT.DRAG_SCROLL_STEP
  } else if (x < DRAG_CONSTANT.DRAG_SCROLL_STEP) {
    container.scrollLeft -= DRAG_CONSTANT.DRAG_SCROLL_STEP
  }
  if (y > rect.height - DRAG_CONSTANT.DRAG_SCROLL_STEP) {
    container.scrollTop += DRAG_CONSTANT.DRAG_SCROLL_STEP
  } else if (y < DRAG_CONSTANT.DRAG_SCROLL_STEP) {
    container.scrollTop -= DRAG_CONSTANT.DRAG_SCROLL_STEP
  }

  if (event.x > 0 && !isReOrderOperation(event, area)) {
    dragActionHandlers.handleTaskMove(event, d)
  }

  const taskCell = select('#C' + d.data.id)

  taskCell
    .style('transform', `translateX(${offsetX}px) translateY(${offsetY}px)`)
    .style('z-index', DRAG_CONSTANT.DRAGGED_ITEMS_ZINDEX)
}
