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

import { selectAll } from 'd3-selection'
import { CONFIG } from '../../../../../../app/constants'
import { pointInRectangle } from '../../../../../../services/helpers/geometry/point-in-rectangle'
import { ICICLE_CSS_NAME } from '../../../selection/selector'
import {
  clearDropZone,
  isValidStatusDropZone,
  validDropZone,
} from './drop-zone-helpers'

// Note IE11 does not support x and y properties but left and top are equivalent.
export const getRectById = id =>
  document.getElementById(`C${id}`)?.getBoundingClientRect()

export const isReOrderOperation = (event, area) => {
  return pointInRectangle(
    { x: event.sourceEvent.pageX, y: event.sourceEvent.pageY },
    area
  )
}

export const getAllChildren = t => {
  const result = []

  if (t) {
    result.push(t)

    const children = t.tasks || t.children

    if (children) {
      for (let c of children) {
        result.push(...getAllChildren(c))
      }
    }
  }

  return result
}

export const applyOffSetToSubTasks = (d, offsetX, offsetY, zIndex) => {
  const allChildren = getAllChildren(d)
  const data = selectAll(`.${ICICLE_CSS_NAME}`)
    .filter(function () {
      return !this.childNodes[0].classList.contains(
        'minimap_mini-icicle-cell__1HRRE'
      )
    })
    .filter(d => {
      return allChildren.map(n => n.data.id).includes(d.data.id)
    })
  data
    .style('transform', `translateX(${offsetX}px) translateY(${offsetY}px)`)
    .style('z-index', zIndex)
}

export const applyOpacityToSubTasks = (d, opacity) => {
  const allChildren = getAllChildren(d)
  const data = selectAll(`.${ICICLE_CSS_NAME}`)
    .filter(function () {
      return !this.childNodes[0].classList.contains(
        'minimap_mini-icicle-cell__1HRRE'
      )
    })
    .filter(d => {
      return allChildren.map(n => n.data.id).includes(d.data.id)
    })
  data.style('opacity', opacity)
}

export const getDropIndex = (d, rect, y, draggedCellStartingY) => {
  const siblings = d.parent.children
  const dropY = y - rect.top - 17

  let dropIndex = -1

  const generateMidPoint = task => {
    if (!task) {
      return null
    }
    const targetCellRect = getRectById(task.data.id)
    if (!targetCellRect) {
      return null
    }
    const taskY =
      task.data.id !== d.data.id
        ? targetCellRect.top - 117
        : draggedCellStartingY - 117

    let midPoint = targetCellRect ? targetCellRect.height / 2 : 0
    midPoint = taskY + midPoint
    return midPoint
  }

  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i] === undefined) {
      break
    }
    const midPoint = generateMidPoint(siblings[i])
    if (dropY > midPoint) {
      dropIndex = i + 1
    } else if (i === 0 && dropY < midPoint) {
      dropIndex = 0
    }
    if (siblings[i].data.id === d.data.id) {
      if (i > 0 && i < siblings.length - 2) {
        const previousMidpoint = generateMidPoint(siblings[i - 1])
        const nextMidpoint = generateMidPoint(siblings[i + 1])
        if (
          previousMidpoint !== null &&
          nextMidpoint !== null &&
          dropY > previousMidpoint &&
          dropY < nextMidpoint
        ) {
          dropIndex = -1
        }
      } else if (i === 0) {
        const nextMidpoint = generateMidPoint(siblings[i + 1])
        if (dropY < nextMidpoint) {
          dropIndex = -1
        }
      } else if (i === siblings.length - 1) {
        const previousMidpoint = generateMidPoint(siblings[i - 1])
        if (dropY > previousMidpoint) {
          dropIndex = -1
        }
      }
    }
  }
  if (dropIndex === siblings.findIndex(s => s.data.id === d.data.id) + 1) {
    return -1 //handle when you try to move after yourself
  }
  return dropIndex
}

export const getHoveringOver = (d, x, y, ignoreX = false) => {
  const over = selectAll(`.${ICICLE_CSS_NAME}`)
    .filter(task => {
      let coords = getRectById(task.data.id)
      if (ignoreX) {
        return (
          y + 99 >= coords.top &&
          y + 99 <= coords.top + coords.height &&
          task.data.id !== d.data.id
        )
      }

      return (
        x >= coords.findIndexleft &&
        x <= coords.left + coords.width &&
        y + 99 >= coords.top &&
        y + 99 <= coords.top + coords.height &&
        task.data.id !== d.data.id
      )
    })
    .data()

  return over
}

export const isValidDropZone = (d, siblings, dropIndex) => {
  const selfId = d.data.id
  const inSiblings =
    siblings.filter(sibling => sibling.data.id === selfId).length > 0
  const inCorrectStatus = isValidStatusDropZone(dropIndex, siblings, d.data)
  const isValid = inSiblings
    ? true
    : siblings.length < CONFIG.LEVEL_A_TASK_LIMIT
  return isValid && inCorrectStatus
}

export const applyDropZone = (
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
) => {
  if (hoveringOver === undefined || hoveringOver.parent === null) {
    return
  }
  const siblings = d.parent.children

  const dropIndex = getDropIndex(d, { top: 0 }, y, draggedCellStartingY)

  const heightOffset = 117

  const yCoords = siblings.map(s =>
    s.data.id !== d.data.id
      ? getRectById(s.data.id).top - heightOffset
      : draggedCellStartingY - heightOffset
  )
  const xPos = getRectById(siblings[0].data.id).left + scrollLeft

  let dropZoneY = yCoords[dropIndex] + scrollTop

  if (dropZoneY === draggedCellStartingY - heightOffset) {
    //don't show when you're hovetring over the original location
    clearDropZone()
    return
  }

  if (
    (dropZoneY === undefined || isNaN(dropZoneY)) &&
    dropIndex === siblings.length
  ) {
    dropZoneY =
      yCoords[yCoords.length - 1] +
      getRectById(siblings[siblings.length - 1].data.id).height +
      scrollTop
  }

  if (dropZoneY === undefined || isNaN(dropZoneY)) {
    clearDropZone()
    return
  }

  const isValid = isValidDropZone(d, siblings, dropIndex)

  validDropZone(xPos, dropZoneY, 449, 5, isValid)
}
