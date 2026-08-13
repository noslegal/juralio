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

import { applyLevelIndicators } from './core-applicators/levelIndicators-applicator'
import { applyMetaAttributes } from './core-applicators/meta-applicator'
import { applyPhaseLabels } from './core-applicators/phase-label-applicator'
import { applyPositioning } from './core-applicators/positioning-applicator'
import { applyTemplateContent } from './core-applicators/template-applicator'
import { applyNewTaskFilter } from './interaction/new-task-highlight-builder'
import { applyUsability } from './interaction/usability-applicator'

export const update = (
  cells,
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
  showlevelIndicators,
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
) => {
  applyMetaAttributes(cells, parentPropertyName)
  const info = applyPositioning(
    cells,
    scales,
    overviewHeightThreshold,
    separatorPadding
  )
  if (mainIcicleRef) {
    mainIcicleRef.taskCellWidth = info
  }

  applyTemplateContent(
    cells,
    Template,
    interactive,
    selectionMode,
    highlightList,
    selectedItem,
    filterTasksByEmailOn,
    filterMilestone,
    selectedTaskmapItem,
    isReadOnly,
    filteredLabels,
    detailedView,
    viewOnly
  )

  if (showlevelIndicators) applyLevelIndicators(cells, scales)

  if (!moveTargets || !moveTargets.length) {
    applyNewTaskFilter(
      cells,
      newTasks,
      dismissNewTasks,
      mainIcicleRef,
      translationHandler
    )
  }

  !isReadOnly &&
    !selectionMode &&
    !isMobile &&
    applyUsability(
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
    )
  if (showPhaseLabels) {
    applyPhaseLabels(
      cells,
      interactive,
      scales,
      overviewHeightThreshold,
      getTaskDetails
    )
  }

  if (doneTasksToShow && doneTasksToShow.length > 0 && !showDone) {
    cells
      .filter(c => doneTasksToShow.includes(c.data.id))
      .transition()
      .style('opacity', 0)
      .duration(2000)
  }

  return cells
}
