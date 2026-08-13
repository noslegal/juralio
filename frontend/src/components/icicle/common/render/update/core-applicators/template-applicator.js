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

import { ThemeProvider } from '@mui/material/styles'
import { select } from 'd3-selection'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {
  TASK_CELL_COLOUR,
  TASK_MAP_VIEW_MODE_ENUM,
} from '../../../../../../app/constants'
import { filterOutLabels } from '../../../../../../services/helpers/task/filter-tasks'
import { flatTaskListFromTree } from '../../../../../../services/task/data-provider/task-list-data-provider'
import theme from '../../../../../../theme/juralio-theme'
import TaskCell from '../../../../../data-display/task-cell/TaskCell'
import { HEIGHT_THRESHOLD_ATTR_NAME } from '../../../constants'
import DefaultTemplate from '../DefaultTemplate'

function selectTemplate(
  Template = TaskCell,
  interactive,
  selectionMode,
  highlightList,
  selectedItem,
  filterTasksByEmailOn,
  filterMilestone,
  selectedTaskmapItem,
  isReadOnly,
  filteredLabels = [],
  detailedView = {
    viewMode: TASK_MAP_VIEW_MODE_ENUM.STANDARD,
    showRisks: false,
  },
  viewOnly
) {
  return function (d) {
    const element = select(this)
    const isAboveHeightThreshold =
      element.attr(HEIGHT_THRESHOLD_ATTR_NAME) === 'true' ? true : false

    const filterByLabel = (data, filterLabels) => {
      if (filterOutLabels(data, filterLabels)) {
        return TASK_CELL_COLOUR.FILTERED_IN
      } else {
        return TASK_CELL_COLOUR.FILTERED_OUT
      }
    }

    const getColourMode = () => {
      if (filterTasksByEmailOn || filterMilestone || filteredLabels.length) {
        if (
          highlightList &&
          highlightList.filter(item => item.data.id === d.data.id).length > 0
        ) {
          if (filteredLabels.length) {
            return filterByLabel(d.data, filteredLabels)
          }
          return TASK_CELL_COLOUR.FILTERED_IN
        } else if (filteredLabels.length) {
          return filterByLabel(d.data, filteredLabels)
        } else {
          return TASK_CELL_COLOUR.FILTERED_OUT
        }
      } else {
        return TASK_CELL_COLOUR.NORMAL
      }
    }

    let colourMode = getColourMode()

    const isHighlighted =
      (highlightList &&
        highlightList
          .map(item => {
            return item.id ? item.id : item?.data?.id
          })
          .includes(d.data?.id)) ||
      false

    let isSelectedChild =
      selectedItem &&
      flatTaskListFromTree(selectedItem)
        .map(d => d.id)
        .includes(d.data.id)

    let isSelected =
      (selectedItem && selectedItem.id === d.data.id) || isSelectedChild

    return ReactDOMServer.renderToString(
      <ThemeProvider theme={theme}>
        {Template ? (
          <Template
            item={d.data}
            isAboveHeightThreshold={isAboveHeightThreshold}
            interactive={interactive}
            selectionMode={selectionMode}
            isHighlighted={isHighlighted}
            colourMode={colourMode}
            isSelected={isSelected}
            selectedTask={selectedTaskmapItem}
            isReadOnly={isReadOnly}
            detailedView={detailedView}
            compactHeight={
              detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
            }
            viewOnly={viewOnly}
          />
        ) : (
          <DefaultTemplate item={d.data} />
        )}
      </ThemeProvider>
    )
  }
}

export function applyTemplateContent(
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
) {
  return cells.html(
    selectTemplate(
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
  )
}
