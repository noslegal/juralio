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

import { selectAll, select } from 'd3-selection'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

export const setUpTaskBlockerInteractions = (cells, mainIcicleRef) => {
  const generateTooltip = context => {
    switch (context) {
      case 'task-blocked-icon':
        return ReactDOMServer.renderToString(
          <div style={{ width: 'fit-content' }}>
            At least one other task should be
            <br /> completed before this task is started.
            <br /> See task details to find out more.
          </div>
        )
      case 'task-blocker-icon':
        return ReactDOMServer.renderToString(
          <div style={{ width: 'fit-content' }}>
            This task should be completed
            <br />
            before at least one other task.
            <br />
            See task details to find out more.
          </div>
        )
      default:
        return null
    }
  }

  selectAll('[data-test^=task-blocker-icon').on('mouseover', e => {
    e.stopPropagation()
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 85) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX - 62) + 'px')
    if (select('#linkTooltip').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'linkTooltip')
        .html(generateTooltip('task-blocker-icon'))
    }
  })

  selectAll('[data-test=task-blocker-icon').on('mouseout', e => {
    e.stopPropagation()
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#linkTooltip').remove()
  })

  selectAll('[data-test^=task-blocked-icon').on('mouseover', e => {
    e.stopPropagation()
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 85) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX - 62) + 'px')
    if (select('#linkTooltip').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'linkTooltip')
        .html(generateTooltip('task-blocked-icon'))
    }
  })

  selectAll('[data-test=task-blocked-icon').on('mouseout', e => {
    e.stopPropagation()
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#linkTooltip').remove()
  })
}
