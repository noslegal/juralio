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

import ErrorIcon from '@mui/icons-material/Error'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { select } from 'd3-selection'
import { transition } from 'd3-transition'
import i18n from 'i18next'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import juralioColours from '../../../../../../theme/juralio-colours'

const VALID_BACKGROUND_COLOUR = juralioColours.taskMap.dropZone.valid
const INVALID_BACKGROUND_COLOUR = juralioColours.taskMap.dropZone.invalid

export const validDropZone = (x, y, width, height, isValid = true) => {
  select('#dropZonePointer')
    .style('display', 'flex')
    .style('left', `${x}px`)
    .style('top', `${y}px`)
    .style('width', `${width}px`)
    .style('height', `${height}px`)
    .style('z-index', '100')
    .style(
      'background',
      isValid ? VALID_BACKGROUND_COLOUR : INVALID_BACKGROUND_COLOUR
    )

  const left = x + width
  const top = y - (30 - height) / 2
  select('#dropZoneIcon')
    .style('display', 'flex')
    .style('left', `${left}px`)
    .style('position', 'absolute')
    .style('top', `${top}px`)
  if (isValid) {
    select('#dropZoneIcon').selectAll('*').remove()
    select('#dropZoneIcon')
      .style('display', 'flex')
      .style('z-index', '9001')
      .append('div')
      .style(
        'background',
        isValid ? VALID_BACKGROUND_COLOUR : INVALID_BACKGROUND_COLOUR
      )
      .style('border-radius', '4px')
      .style('display', 'flex')
      .html(
        ReactDOMServer.renderToString(
          <SwapVertIcon
            style={{
              fill: 'white',
              width: '28px',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          />
        )
      )
  } else {
    const alreadyOpen =
      select('#dropZoneIcon').selectAll('#bad-dropzone').size() === 1
    if (!alreadyOpen) {
      select('#dropZoneIcon').selectAll('*').remove()
      select('#dropZoneIcon')
        .style('display', 'flex')
        .style('z-index', '9001')
        .append('div')
        .attr('id', 'bad-dropzone')
        .style(
          'background',
          isValid ? VALID_BACKGROUND_COLOUR : INVALID_BACKGROUND_COLOUR
        )
        .style('z-index', 100)
        .style('border-radius', '4px')
        .style('display', 'flex')
        .html(
          ReactDOMServer.renderToString(
            <ErrorIcon
              style={{
                fill: 'white',
                width: '28px',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            />
          )
        )

      const fadeIn = transition().duration(1000)

      select('#dropZoneIcon')
        .style('display', 'flex')
        .append('div')
        .attr('id', 'dropZoneIconTooltip')
        .style('width', '180px')
        .style('height', '40px')
        .style('left', '40px')
        .style('border-radius', '4px')
        .style('position', 'absolute')
        .style('color', 'white')
        .style('font-size', '12px')
        .style('font-family', 'montserrat')
        .style('background-color', INVALID_BACKGROUND_COLOUR)
        .style('opacity', 0)
        .style('text-align', 'center')
        .style('padding-left', '4px')
        .style('padding-right', '4px')
        .style('padding-top', '4px')
        .style('z-index', '9001')
        .attr('data-test', 'dropzone-bad-status-tooltip')
        .text(i18n.t('taskMap.dropZoneError'))

      select('#dropZoneIconTooltip').transition(fadeIn).style('opacity', 1)
    }
  }
}

export const clearDropZone = () => {
  if (select('#dropZonePointer').style('display') !== 'none') {
    select('#dropZonePointer')
      .style('height', '5px')
      .style('width', '449px')
      .style('position', 'absolute')
      .style('display', 'none')
      .style('z-index', '-100')
    select('#dropZoneIcon').selectAll('*').remove()
    select('#dropZoneIcon').style('display', 'none').style('z-index', '-100')
  }
}

export const isValidStatusDropZone = (dropIndex, siblings, self) => {
  if (dropIndex < 0 || dropIndex > siblings.length) {
    return false
  }
  const status = {
    'not-started': 0,
    'in-progress': 1,
    done: 2,
    'task-not-required': -1,
    undefined: -2,
  }
  if (dropIndex === 0) {
    return status[self.status] >= status[siblings[0].data.status]
  } else if (dropIndex === siblings.length - 1) {
    return (
      status[self.status] <= status[siblings[siblings.length - 1].data.status]
    )
  } else if (dropIndex === siblings.length) {
    return (
      status[self.status] <= status[siblings[siblings.length - 1].data.status]
    )
  } else {
    return (
      status[self.status] <= status[siblings[dropIndex - 1].data.status] &&
      status[self.status] >= status[siblings[dropIndex].data.status]
    )
  }
}
