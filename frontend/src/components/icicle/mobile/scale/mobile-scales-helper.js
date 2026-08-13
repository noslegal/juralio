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

import { scaleLinear } from 'd3-scale'

const FOCUSED_AREA_PADDING_PERCENTAGE = 10

export const createWidthScale = (containerElement, area, padding) =>
  scaleLinear()
    .domain([area.startCoordinate - padding, area.endCoordinate + padding])
    .range([0, containerElement.clientWidth])

export const createHeightScale = (containerElement, focusedNode) => {
  const edgePadding = 8
  const topSpacing = 6 * edgePadding
  const bottomSpacing = 1 * edgePadding

  return scaleLinear()
    .domain([focusedNode.x0, focusedNode.x1])
    .range([topSpacing, containerElement.clientHeight - bottomSpacing])
}

/**
 * Calculates the coordinates required to show the children of the focused item.
 *
 * The area is calculated by assuming that every cell in the icicle has the same height.
 * Therefore, the area required to show the children is essentially the same area as
 * the given focused item offset by its own bottom edge.
 *
 * @param {object} focusedItem The item to be focused. Must have y0 and y1 coordinates as populated by partition layout data provider.
 */
export const calculateFocusedAreaCoordinates = focusedItem => {
  const focusedItemHeight = focusedItem.y1 - focusedItem.y0

  return {
    startCoordinate: focusedItem.y1,
    endCoordinate: focusedItem.y1 + focusedItemHeight,
  }
}

export const calculateFocusedAreaPadding = focusedItem =>
  (focusedItem.y1 - focusedItem.y0) / FOCUSED_AREA_PADDING_PERCENTAGE
