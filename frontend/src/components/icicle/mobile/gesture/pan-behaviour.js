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
import { zoom, zoomIdentity } from 'd3-zoom'
import {
  determinePanDirection,
  getTranslation,
  handleSwipe,
} from './gesture-helper'
import { getPanDirection, setPanDirection } from './pan-state-holder'
import { selectIcicleElementFromEvent } from '../../common/selection/selector'

export const getPanInstance = () => zoom().scaleExtent([1, 1])

export const zoomed = (event, node) => () => {
  if (!getPanDirection()) {
    setPanDirection(determinePanDirection(event))
  }

  const translation = getTranslation(getPanDirection(), event.transform)

  select(node).style(
    'transform',
    `translate(${translation.x}px, ${translation.y}px)`
  )
}

export const onEnd =
  (event, node, container, panInstance, swipeCallback) => () => {
    panInstance.on('zoom', null)
    panInstance.on('end', null)

    setPanDirection(undefined)
    const swipedElement = selectIcicleElementFromEvent(event)
    handleSwipe(container, event.transform, swipedElement, swipeCallback)

    select(container).call(panInstance.transform, zoomIdentity)

    select(node)
      .transition()
      .duration(500)
      .style('transition-timing-function', 'cubic-bezier(0.25, 0.1, 0.25, 1)')
      .style('transform', 'translate(0px, 0px)')

    panInstance.on('zoom', event => zoomed(event, node))
    panInstance.on('end', event =>
      onEnd(event, node, container, panInstance, swipeCallback)
    )
  }
