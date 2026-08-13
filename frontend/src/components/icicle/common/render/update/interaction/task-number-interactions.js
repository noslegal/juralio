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

import i18n from 'i18next'

import { selectAll, select } from 'd3-selection'

import { sendTextToClipboard } from '../../../../../../services/clipboard/clipboard-service'
import { generateTooltip } from './reference-number-tooltip-helper'

export const setUpTaskCellNumberInteractions = (
  cells,
  mainIcicleRef,
  showSnackbarHandler
) => {
  selectAll('#reference-number').on('click', e => {
    e.stopPropagation()
    const taskId =
      e.srcElement.parentNode.parentNode.getAttribute('data-task-id')
    if (taskId == null) {
      return
    }
    const target = window.location.href
      .split('?')[0]
      .replace('taskmap', 'task/' + taskId)
    sendTextToClipboard(target)
    showSnackbarHandler(i18n.t('taskDetails.urlOfTaskCopiedToClipbard'))
  })

  selectAll('#reference-number').on('mouseover', e => {
    e.stopPropagation()
    let referenceNumber = e.srcElement.parentNode.parentNode.getAttribute(
      'data-task-reference-number'
    )
    if (referenceNumber === null) {
      referenceNumber = e.srcElement.getAttribute('data-task-reference-number')
    }
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 135) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX + 40) + 'px')
      .style('width', '340px')
    if (select('#linkTooltip').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'linkTooltip')
        .html(generateTooltip(referenceNumber))
    }
  })

  selectAll('#reference-number').on('mouseout', e => {
    e.stopPropagation()
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#linkTooltip').remove()
  })
}
