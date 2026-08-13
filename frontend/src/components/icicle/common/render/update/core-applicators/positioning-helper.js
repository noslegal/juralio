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

import {
  calculateHeightPadding,
  getSeparatorPadding,
} from '../separator-padding-helper'

const CELL_PADDING = 1

export const dimensions = {}

export const getLeftPosition = (data, scales) =>
  scales.widthScale(data.y0) + CELL_PADDING

export const getTopPosition = (data, scales, separatorPadding) =>
  scales.heightScale(data.x0) +
  CELL_PADDING +
  getSeparatorPadding(data, separatorPadding)

export const getWidth = (data, scales) => {
  let widthScale = scales.widthScale
  let width = widthScale(data.y1) - widthScale(data.y0) - CELL_PADDING
  dimensions.width = width
  return width
}

export const getHeight = (data, scales, separatorPadding) => {
  let heightScale = scales.heightScale
  let height = heightScale(data.x1) - heightScale(data.x0) - CELL_PADDING
  height += calculateHeightPadding(data, separatorPadding)

  return height
}
