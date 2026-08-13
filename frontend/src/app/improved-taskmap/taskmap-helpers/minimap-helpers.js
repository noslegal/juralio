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

/**
 * Using the minimap and taskmap container dimensions we calculate the scale of the X axis e.g 6%
 * @returns The percentage size that all minimap components should be of the main taskmaps X axis values
 */
export const getMiniMapOverallScaleWidth = () => {
  let taskmap = document.getElementById('improved-taskmap')
  if (taskmap) {
    let overallWidthScale = 184 / taskmap.getBoundingClientRect()?.width
    return overallWidthScale
  }
  return 0
}

export const getViewportWidth = () => {
  let screenWidth = document.documentElement.clientWidth
  let taskmap = document.getElementById('improved-taskmap')
  if (taskmap) {
    const taskmapWidth = taskmap.getBoundingClientRect()?.width

    return (Math.min(100, (screenWidth / taskmapWidth) * 100) / 100) * 184
  }
  return 0
}
export const getViewportHeight = () => {
  let screenHeight = document
    .getElementById('improved-taskmap-wrapper')
    ?.getBoundingClientRect()?.height
  let taskmap = document?.getElementById('improved-taskmap')
  const taskmapHeight = taskmap ? taskmap.getBoundingClientRect()?.height : 1
  const minimapHeight = 240
  const vph =
    (Math.min(100, (screenHeight / taskmapHeight) * 100) / 100) * minimapHeight

  return vph
}

export const getHeightForMinimapCell = leafCount => {
  let minimapHeight = 184
  return Math.floor(minimapHeight / leafCount) - 2
}

export const getWidthForMinimapCell = depth => {
  let minimapWidth = 184
  return Math.floor(minimapWidth / depth) - 2
}

/**
 * Using the minimap and taskmap container dimensions we calculate the scale of the Y axis e.g 8%
 * @returns The percentage size that all minimap components should be of the main taskmaps Y axis values
 */
export const getMiniMapOverallScaleHeight = () => {
  let taskmap = document.getElementById('improved-taskmap')
  if (taskmap) {
    const minimapHeight = 240
    let overallHeightScale =
      minimapHeight / taskmap.getBoundingClientRect()?.height

    return overallHeightScale
  }
  return 0
}

/**
 * Calculate the new viewport X position using the taskmap scroll offset and widthScale calculated with getMiniMapOverallScaleWidth()
 * @returns The new viewport X axis position in the minimap relative to the taskmap position
 */
export const getViewportXPos = widthScale => {
  let taskmap = document.getElementById('improved-taskmap-wrapper')
  if (taskmap) {
    let taskmapScrollOffset = taskmap.scrollLeft
    let x = taskmapScrollOffset * widthScale
    return x
  }
  return 0
}

/**
 * Calculate the new viewport Y position using the taskmap scroll offset and heightScale calculated with getMiniMapOverallScaleHeight()
 * @returns The new viewport Y axis position in the minimap relative to the taskmap position
 */
export const getViewportYPos = heightScale => {
  let taskmap = document.getElementById('improved-taskmap-wrapper')
  if (taskmap) {
    let taskmapScrollOffset = taskmap.scrollTop
    let y = taskmapScrollOffset * heightScale
    return y
  }
  return 0
}
