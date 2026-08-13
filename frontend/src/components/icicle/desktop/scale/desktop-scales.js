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
import { TASK_MAP_VIEW_MODE_ENUM } from '../../../../app/constants'
import {
  getInteractiveContainerHeight,
  getInteractiveContainerWidth,
} from './desktop-scales-helper'

export const createScales = (
  containerElement,
  partitionData,
  isInteractive,
  interactiveProps,
  separatorPadding,
  edgePadding,
  detailedView = { viewMode: TASK_MAP_VIEW_MODE_ENUM.STANDARD }
) => {
  let rect = containerElement.getBoundingClientRect()
  let maxWidth = rect.width
  let maxHeight = rect.height

  const topSpacing = 2 * edgePadding
  const bottomSpacing = 1 * edgePadding
  const leftSpacing = 1 * edgePadding
  const rightSpacing = 1 * edgePadding

  if (isInteractive) {
    maxWidth =
      getInteractiveContainerWidth(
        partitionData,
        interactiveProps.fixedCellWidth
      ) +
      leftSpacing +
      rightSpacing

    maxHeight =
      getInteractiveContainerHeight(
        partitionData,
        interactiveProps.minCellHeight
      ) +
      topSpacing +
      bottomSpacing
  } else {
    const levelAChildren = partitionData.children || []

    maxHeight -= separatorPadding * (levelAChildren.length - 1)
  }

  let widthScale = scaleLinear()
  widthScale.domain([partitionData.y1, 1])
  widthScale.range([leftSpacing, maxWidth - rightSpacing])

  let heightScale = scaleLinear()
  let maxHeightRange = maxHeight - bottomSpacing
  if (detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED) {
    maxHeightRange = maxHeightRange + 800
  }

  heightScale.range([topSpacing, maxHeightRange])

  return {
    maxWidth,
    maxHeight,
    widthScale,
    heightScale,
  }
}
