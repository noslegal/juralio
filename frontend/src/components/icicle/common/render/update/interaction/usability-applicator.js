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

import { drag } from 'd3-drag'
import { easeCubic } from 'd3-ease'
import { select } from 'd3-selection'
import { CONFIG, TASK_STATUS } from '../../../../../../app/constants'
import { showTaskPreview } from '../../../../../../app/task-details/task-actions'
import configureStore from '../../../../../../store/configure-store'
import { ICICLE_CSS_NAME } from '../../../selection/selector'
import { getHeight, getWidth } from '../core-applicators/positioning-helper'
import { generateHoverButtonHTML } from '../CreateTaskHoverButtons'
import { generateMoveButtonHTML } from '../CreateTaskMoveButtons'
import * as taskHoverButtonsTooltip from './disabled-task-hover-button-interaction'
import {
  handleDrag,
  handleDragEnd,
  handleDragStart,
} from './drag-and-drop-helper'
import * as taskPostCount from './post-count-interaction'
import * as taskBlockers from './task-blockers-interaction'
import * as taskCellAssignees from './task-cell-assignee-interactions'
import * as taskCellDates from './task-cell-date-selector-helper'
import * as taskDatesLinked from './task-date-link-interaction'
import * as taskNumber from './task-number-interactions'

let cachedHoverButtonHTML
let cachedMoveButtons

const getHoverButtonHTML = options => {
  return (cachedHoverButtonHTML =
    cachedHoverButtonHTML || generateHoverButtonHTML(options))
}

const getMoveButtonHTML = () => {
  return (cachedMoveButtons = cachedMoveButtons || generateMoveButtonHTML())
}

const FADE_DURATION = 225
const FADE_IN_DELAY = FADE_DURATION * 2.0
const HOVER_BUTTONS_ID = 'hoverButtons'
const MOVE_BUTTONS_ID = 'dragButtons'

export const NEW_TASK_TRANSITION_DURATION = 225
export const TASKMAP_NEW_TASK_FLOW_STARTED = -1
export const TASKMAP_NEW_TASK_FLOW_CONFIRMED = -2

function fadeIn(selection) {
  if (selection && !selection.empty()) {
    const delay = selection.style('opacity') > 0 ? 0.0 : FADE_IN_DELAY

    selection
      .interrupt()
      .transition()
      .duration(FADE_DURATION)
      .delay(delay)
      .style('opacity', 1.0)
  }
}

let currentHoveredIcicleCell = null

function fadeOutAndRemove(selection) {
  if (selection && !selection.empty()) {
    selection
      .transition()
      .duration(FADE_DURATION)
      .style('opacity', 0.0)
      .remove()
  }
}

const appendHoverButtons = (selectedTaskCell, options) => {
  return selectedTaskCell
    .append('div')
    .attr('id', HOVER_BUTTONS_ID)
    .html(getHoverButtonHTML(options))
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('width', '100%')
    .style('height', '100%')
    .style('cursor', 'default')
    .style('pointer-events', 'none')
    .style('z-index', 2)
    .style('opacity', 1.0)
}

const fadeInHoverButtons = (
  d,
  hoverButtons,
  projectTasks
  // options = { right: { disabled: false } }
) => {
  let fadingIn = false
  const children = d.data.tasks || d.data.children

  if (children && children.length === 0 && d.data.level < 6) {
    const createChildButton = hoverButtons.select(
      '[data-create-task-hover-button=right]'
    )

    fadeIn(createChildButton)
    fadingIn = true
  }

  if (d.parent) {
    const foundTask = projectTasks.find(task => task.id === d.parent.data.id)
    let canCreateSiblings = false
    if (foundTask) {
      canCreateSiblings = foundTask.childCount < 8
    } else if (d.data.level === 1) {
      //level A
      const levelATasks = projectTasks.filter(task => task.level === 1).length
      canCreateSiblings = levelATasks < 8
    } else {
      const parentTasks = d.parent.data.tasks || d.parent.data.children
      canCreateSiblings = parentTasks.length < 8
    }

    if (canCreateSiblings) {
      const createSiblingAboveButton = hoverButtons.select(
        '[data-create-task-hover-button=above]'
      )
      fadeIn(createSiblingAboveButton)
      const createSiblingBelowButton = hoverButtons.select(
        '[data-create-task-hover-button=below]'
      )
      fadeIn(createSiblingBelowButton)
      fadingIn = true
    }
  }

  if (fadingIn) {
    hoverButtons.interrupt().style('opacity', 1.0)
  }
}

const getOrCreateHoverButtons = options => {
  const selectedTaskCell = select(currentHoveredIcicleCell)
  let hoverButtons = selectedTaskCell.select(`#${HOVER_BUTTONS_ID}`)

  if (!hoverButtons || hoverButtons.empty()) {
    hoverButtons = appendHoverButtons(selectedTaskCell, options)
  }

  return hoverButtons
}

export const fadeOutHoverButtons = () => {
  const hoverButtons = select(currentHoveredIcicleCell).select(
    `#${HOVER_BUTTONS_ID}`
  )

  currentHoveredIcicleCell = null

  if (hoverButtons && !hoverButtons.empty()) {
    fadeOutAndRemove(hoverButtons)
  }
}

const handleMouseOver = (
  event,
  d,
  cell_count = 0,
  projectTasks,
  mainIcicleRef,
  viewOnly
) => {
  if (d.depth === 0 || d.data.status === TASK_STATUS.NOT_REQUIRED) return
  if (currentHoveredIcicleCell) return
  let target = event.target.closest(`.${ICICLE_CSS_NAME}`)
  if (!target) return
  currentHoveredIcicleCell = target

  let hoverButtons = getOrCreateHoverButtons({
    right: { disabled: d.data.isMilestone },
  })
  if (cell_count < CONFIG.PROJECT_TASK_LIMIT + 1 && !viewOnly) {
    fadeInHoverButtons(d, hoverButtons, projectTasks)
  }

  const leftPos =
    parseInt(currentHoveredIcicleCell.style.left.slice(0, -2)) -
    mainIcicleRef.scrollLeft

  taskHoverButtonsTooltip.setUpTaskCellDisabledHoverButtonTooltip(mainIcicleRef)

  select(`#visibility-${d.data.id}`)
    .on('click', e => {
      e.stopPropagation()
      let topPos = e.target.getBoundingClientRect().y - 137

      topPos = Math.min(topPos, window.innerHeight)
      configureStore.dispatch(
        showTaskPreview(
          d.data,
          {
            left: leftPos,
            top: topPos,
          },
          viewOnly
        )
      )
    })
    .transition()
    .ease(easeCubic)
    .duration(FADE_DURATION)
    .style('opacity', 1)
}

const handleMouseOut = (event, d) => {
  if (!currentHoveredIcicleCell) return

  let relatedTarget = event.relatedTarget

  while (relatedTarget) {
    if (relatedTarget === currentHoveredIcicleCell) return

    relatedTarget = relatedTarget.parentNode
  }

  fadeOutHoverButtons()

  select(`#visibility-${d.data.id}`)
    .transition()
    .ease(easeCubic)
    .duration(FADE_DURATION)
    .style('opacity', 0)
}

const applyNewChildTaskTransition = (newTasks, scales) => {
  const newChildTasks = newTasks.filter(d => !d.data.isCreatedFromSibling)

  newChildTasks
    .style('transform', d => `translateX(-${getWidth(d, scales)}px)`)
    .style('z-index', 0)
    .transition()
    .ease(easeCubic)
    .duration(NEW_TASK_TRANSITION_DURATION)
    .style('transform', 'translateX(0px)')
    .on('end', () => select(this).style('z-index', 1))
}

const applyNewSiblingTaskTransition = (newTasks, scales) => {
  const newSiblingTasks = newTasks.filter(d => d.data.isCreatedFromSibling)

  newSiblingTasks
    .style(
      'transform',
      d => `translateY(${(d.data.above ? 1 : -1) * getHeight(d, scales)}px)`
    )
    .style('z-index', 0)
    .transition()
    .ease(easeCubic)
    .duration(NEW_TASK_TRANSITION_DURATION)
    .style('transform', 'translateY(0px)')
    .on('end', () => select(this).style('z-index', 1))
}

const applyMoveTargets = (cells, moveTargets, selectedItem) => {
  cells
    .filter(function (cell) {
      return (
        (!Object.keys(cell.data).includes('id') &&
          selectedItem.level !== 1 &&
          !selectedItem.isMilestone) ||
        moveTargets.includes(cell.data.id)
      )
    })
    .append('div')
    .attr('id', MOVE_BUTTONS_ID)
    .html(getMoveButtonHTML())
}

export const applyUsability = (
  cells,
  interactive,
  scales,
  moveTargets,
  selectedItem,
  mainIcicleRef,
  highlightList,
  projectTasks,
  showSnackbarHandler,
  viewOnly,
  externalUser
) => {
  if (moveTargets.length && !viewOnly) {
    applyMoveTargets(cells, moveTargets, selectedItem)
  } else {
    const cellCount = cells._groups[0].length
    const interactiveCells = cells.filter(cell =>
      highlightList
        ? highlightList.includes(cell) || !highlightList.length
        : true
    ) //dont interact with non-highlighted tasks
    const output = cells
      .on(
        'mouseover',
        interactive
          ? (e, d) =>
              handleMouseOver(
                e,
                d,
                cellCount,
                projectTasks,
                mainIcicleRef,
                viewOnly
              )
          : null
      )
      .on('mouseout', interactive ? (e, d) => handleMouseOut(e, d) : null)

    const newTasks = output.filter(
      datum => datum.data.id === TASKMAP_NEW_TASK_FLOW_STARTED
    )

    select('#innerWrapper')
      .append('div')
      .attr('class', 'generic-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('z-index', '11')
      .style('color', 'rgba(255, 255, 255,1)')
      .style('background-color', 'rgba(46, 47, 48, 0.7)')
      .style('padding-top', '8px')
      .style('padding-bottom', '8px')
      .style('padding-left', '16px')
      .style('padding-right', '16px')
      .style('border-radius', '4px')
      .style('white-space', 'nowrap')
      .style('font-family', 'Montserrat')
      .style('font-size', '12px')
      .style('height', '16px')
      .style('letter-spacing', '0.4px')

    select('#dropZonePointer').node()
      ? select('#dropZonePointer')
      : select('#innerWrapper')
          .append('div')
          .attr('id', 'dropZonePointer')
          .style('height', '5px')
          .style('width', '449px')
          .style('background', 'red')
          .style('position', 'absolute')
          .style('display', 'none')
          .attr('data-test', 'drop-zone-pointer')

    select('#dropZoneIcon').node()
      ? select('#dropZoneIcon')
      : select('#innerWrapper')
          .append('div')
          .attr('id', 'dropZoneIcon')
          .style('height', '30px')
          .style('width', '30px')

    taskCellDates.setUpTaskDatePicker(cells)
    taskCellAssignees.setUpTaskCellAssigneeInteractions(
      cells,
      mainIcicleRef,
      viewOnly
    )
    taskDatesLinked.setUpTaskCellDateInteractions(
      interactiveCells,
      mainIcicleRef
    )
    taskNumber.setUpTaskCellNumberInteractions(
      interactiveCells,
      mainIcicleRef,
      showSnackbarHandler
    )
    taskPostCount.setUpTaskCellPostCountInteractions(
      interactiveCells,
      mainIcicleRef,
      showSnackbarHandler
    )

    taskBlockers.setUpTaskBlockerInteractions(interactiveCells, mainIcicleRef)

    if (newTasks.length > 0) {
      applyNewChildTaskTransition(newTasks, scales)
      applyNewSiblingTaskTransition(newTasks, scales)
    }

    const dragHandler = drag()
      .on('start', !viewOnly && !externalUser ? handleDragStart : () => {})
      .on('end', !viewOnly && !externalUser ? handleDragEnd : () => {})
      .on(
        'drag',
        (event, d) =>
          !viewOnly && !externalUser && handleDrag(event, d, mainIcicleRef)
      )

    return dragHandler(output)
  }
}
