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
import { selectAllCells } from '../selection/selector'
import { enter } from './enter/enter-step'
import { dragActionHandlers } from './update/interaction/drag-and-drop-helper'
import { update } from './update/update-step'

const getOrCreateInnerWrapper = outerContainer => {
  const innerWrapper = outerContainer.select('#innerWrapper')

  if (innerWrapper && !innerWrapper.empty()) {
    return innerWrapper
  }

  return outerContainer
    .append('div')
    .attr('id', 'innerWrapper')
    .style('position', 'absolute')
}

export const render = (
  containerElement,
  scales,
  partitionData,
  parentPropertyName,
  Template,
  overviewHeightThreshold,
  separatorPadding = 0,
  interactive,
  selectionMode,
  highlightList,
  showPhaseLabels,
  showSnackbarHandler,
  translationHandler,
  reorderTaskHandler,
  handleTaskMove,
  moveTargets,
  selectedItem,
  getTaskDetails,
  getLatestPost,
  newTasks,
  dismissNewTasks,
  mainIcicleRef,
  userData,
  levelIndicators,
  levelCount,
  filterTasksByEmailOn,
  filterMilestone,
  selectedTaskmapItem,
  isReadOnly,
  projectTasks,
  doneTasksToShow,
  showDone,
  filteredLabels,
  detailedView,
  viewOnly,
  externalUser
) => {
  const selectedContainerElement = select(containerElement)
  let isMobile = false

  if (showSnackbarHandler) {
    dragActionHandlers.showSnackbarHandler = showSnackbarHandler
    dragActionHandlers.translationHandler = translationHandler
    dragActionHandlers.reorderTaskHandler = reorderTaskHandler
    dragActionHandlers.handleTaskMove = handleTaskMove
    dragActionHandlers.containerElement = containerElement
  } else {
    isMobile = true
  }

  if (
    (selectedContainerElement && !selectedContainerElement.empty()) ||
    (newTasks && newTasks.length)
  ) {
    const innerWrapper = getOrCreateInnerWrapper(
      selectedContainerElement,
      scales,
      separatorPadding
    )
      .style('width', `${scales.maxWidth}px`)
      .style('height', `${scales.maxHeight + 88}px`)
    const targetNode = innerWrapper.node()

    const dataBoundCells = selectAllCells(targetNode).data(
      partitionData.descendants(),
      d => d.data.id
    )

    const enterStep = enter(dataBoundCells)
    update(
      enterStep,
      parentPropertyName,
      scales,
      Template,
      overviewHeightThreshold,
      separatorPadding,
      interactive,
      selectionMode,
      highlightList,
      showPhaseLabels,
      isMobile,
      moveTargets,
      selectedItem,
      getTaskDetails,
      getLatestPost,
      newTasks,
      dismissNewTasks,
      mainIcicleRef,
      translationHandler,
      userData,
      levelIndicators,
      levelCount,
      filterTasksByEmailOn,
      filterMilestone,
      selectedTaskmapItem,
      isReadOnly,
      projectTasks,
      showSnackbarHandler,
      doneTasksToShow,
      showDone,
      filteredLabels,
      detailedView,
      viewOnly,
      externalUser
    )
  }
}
