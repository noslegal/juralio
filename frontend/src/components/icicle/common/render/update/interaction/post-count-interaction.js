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

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import i18n from 'i18next'

import { selectAll, select } from 'd3-selection'

import { ICICLE_CSS_NAME } from '../../../selection/selector'

const generateTooltip = tooltipText => {
  return ReactDOMServer.renderToString(
    <div style={{ width: 225 }}>{tooltipText}</div>
  )
}

export const setUpTaskCellPostCountInteractions = (cells, mainIcicleRef) => {
  selectAll('#task-post-count').on('mouseover', e => {
    e.stopPropagation()
    const taskId = parseInt(
      e.target.closest(`.${ICICLE_CSS_NAME}`).id.substring(1)
    )
    const cellData = cells.data().find(cell => cell.data.id === taskId)
    const tooltipText = i18n.t(
      cellData.data.posts.length > 1
        ? 'taskmapPosts.multiple'
        : 'taskmapPosts.single',
      { count: cellData.data.posts.length }
    )
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 85) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX - 62) + 'px')
      .style('width', 'fit-content')
    if (select('#linkTooltip').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'linkTooltip')
        .html(generateTooltip(tooltipText))
    }
  })

  selectAll('#task-post-count').on('mouseout', e => {
    e.stopPropagation()
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#linkTooltip').remove()
  })
}
