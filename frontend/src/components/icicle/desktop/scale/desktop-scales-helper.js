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

export const parentCellWidth = 40

export const getWidthScaleOffset = dataItem =>
  dataItem.y0 ? parentCellWidth : 0

export const getInteractiveContainerWidth = (partitionData, cellWidth) =>
  Math.max(...partitionData.leaves().map(leaf => leaf.depth)) * cellWidth

export const getInteractiveContainerHeight = (partitionData, cellHeight) =>
  partitionData.leaves().length * cellHeight
