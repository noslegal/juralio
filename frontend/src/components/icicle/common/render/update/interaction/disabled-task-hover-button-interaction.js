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

const generateTooltip = tooltipText => {
  return ReactDOMServer.renderToString(
    <div style={{ width: 225 }}>{tooltipText}</div>
  )
}

export const setUpTaskCellDisabledHoverButtonTooltip = mainIcicleRef => {
  selectAll('#disabled-hover-button').on('mouseover', e => {
    e.stopPropagation()

    const tooltipText = i18n.t('taskCellHoverButton.disabledButton')
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 85) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX - 62) + 'px')
      .style('width', '246px')
    if (select('#linkTooltip').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'linkTooltip')
        .html(generateTooltip(tooltipText))
    }
  })

  selectAll('#disabled-hover-button').on('mouseout', e => {
    e.stopPropagation()
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#linkTooltip').remove()
  })
}
